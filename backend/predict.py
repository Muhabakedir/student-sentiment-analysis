import os
import re
from dotenv import load_dotenv

load_dotenv()

# ── LABEL MAPPING ────────────────────────────────────────
ID2LABEL = {0: "negative", 1: "neutral", 2: "positive"}

def _resolve_label(label: str) -> str:
    """Map HF model output labels to standard sentiment names.
    
    Handles both formats:
      - Named labels:  "NEGATIVE", "POSITIVE", "NEUTRAL"
      - Indexed labels: "LABEL_0", "LABEL_1", "LABEL_2"
    """
    upper = label.upper().strip()
    # Named labels (e.g. cardiffnlp model)
    if "NEGATIVE" in upper:
        return "negative"
    if "POSITIVE" in upper:
        return "positive"
    if "NEUTRAL" in upper:
        return "neutral"
    # Indexed labels (e.g. muhaba23/student-sentiment-model)
    if upper.startswith("LABEL_"):
        try:
            idx = int(upper.split("_", 1)[1])
            return ID2LABEL.get(idx, "neutral")
        except (ValueError, IndexError):
            return "neutral"
    # Fallback
    return "neutral"

# ── NEGATIVE OVERRIDE PATTERNS ──────────────────────────────
# Regex patterns that ALWAYS indicate negative sentiment,
# regardless of what the model says.
NEGATIVE_OVERRIDE_PATTERNS = [
    re.compile(r"\b(zero|0|no)\s*quality\b", re.I),
    re.compile(r"\bnot\s+(good|great|fine|okay|ok|acceptable|working|available|helpful)\b", re.I),
    re.compile(r"\b(not|no|never|n't)\s+(recommend|worth|useful|reliable|clean|safe)\b", re.I),
    re.compile(r"\b(too|very|really)\s+(slow|bad|poor|dirty|expensive|crowded|noisy|slow)\b", re.I),
    re.compile(r"\b(un)?available\b.*\b(not|no|zero|0|never)\b", re.I),
    re.compile(r"\b(not|no|zero|0)\s*available\b", re.I),
    re.compile(r"\b(almost|nearly)\s+no\b", re.I),
    re.compile(r"\bnothing\b.*\b(work|good|help|available)\b", re.I),
    re.compile(r"\b(can'?t|cannot|don'?t|doesn'?t|won'?t|isn'?t|aren'?t)\b", re.I),
    re.compile(r"\b(worst|terrible|horrible|awful|useless|worthless|garbage|trash)\b", re.I),
]

def _is_forcibly_negative(text: str) -> bool:
    """Return True if text contains unmistakable negative signals."""
    for pattern in NEGATIVE_OVERRIDE_PATTERNS:
        if pattern.search(text):
            return True
    return False

# ── SENTIMENT LEXICON ──────────────────────────────────────
NEGATIVE_WORDS = {
    "terrible", "terrifying", "horrible", "awful", "dreadful", "disgusting",
    "pathetic", "miserable", "worst", "horrendous", "atrocious", "appalling",
    "abysmal", "painful", "unbearable", "intolerable", "unacceptable",
    "frustrating", "annoying", "disappointing", "useless", "worthless",
    "poor", "bad", "rude", "dirty", "slow", "broken", "fail", "failed",
    "failure", "waste", "overpriced", "expensive", "crowded", "noisy",
    "unhelpful", "unprofessional", "incompetent", "neglect", "neglected",
    "complaint", "suffer", "suffering", "problem", "issue", "issues",
    "complain", "angry", "furious", "upset", "disappointed", "worse",
}
POSITIVE_WORDS = {
    "excellent", "amazing", "wonderful", "fantastic", "great", "good",
    "outstanding", "superb", "brilliant", "perfect", "awesome", "love",
    "loved", "best", "helpful", "friendly", "clean", "fast", "efficient",
    "professional", "impressive", "satisfied", "enjoy", "enjoyed",
    "comfortable", "affordable", "reliable", "quality", "recommend",
    "recommended", "pleased", "happy", "glad", "nice", "fine",
}

# ── HUGGING FACE API CONFIGURATION ────────────────────────
HF_API_TOKEN = os.getenv("HF_API_TOKEN", "")
HF_MODEL_NAME = os.getenv("HF_MODEL_NAME", "muhaba23/student-sentiment-model")

# ── CHECK API READY ────────────────────────────────────────
def model_ready() -> bool:
    return bool(HF_API_TOKEN)

# ── PREDICT USING HUGGING FACE INFERENCE CLIENT ─────────────
def predict(text: str) -> dict:
    # Try Hugging Face API first if token is configured
    if HF_API_TOKEN:
        try:
            from huggingface_hub import InferenceClient
            client = InferenceClient(provider="hf-inference", api_key=HF_API_TOKEN)
            result = client.text_classification(text, model=HF_MODEL_NAME)
            print(f"🔍 HF API Response: {result}")

            if result:
                best_pred = max(result, key=lambda x: x.score)
                label = best_pred.label
                confidence = best_pred.score

                sentiment = _resolve_label(label)

                prob_dict = {}
                for pred in result:
                    resolved = _resolve_label(pred.label)
                    prob_dict[resolved] = round(pred.score, 4)
                # If multiple preds resolve to same key, keep the highest score
                for key in ["negative", "neutral", "positive"]:
                    prob_dict.setdefault(key, 0.0)

                # ── Negative override: fix model misclassifications ──
                if sentiment != "negative" and _is_forcibly_negative(text):
                    print(f"  ⚠️ Override: model said '{sentiment}' but text is clearly negative → forcing 'negative'")
                    sentiment = "negative"
                    confidence = round(max(confidence, 0.75), 4)
                    prob_dict = {
                        "negative": round(max(prob_dict.get("negative", 0), 0.75), 4),
                        "neutral": round(min(prob_dict.get("neutral", 0.1), 0.15), 4),
                        "positive": round(min(prob_dict.get("positive", 0.1), 0.10), 4),
                    }

                return {
                    "sentiment": sentiment,
                    "confidence": round(confidence, 4),
                    "probabilities": prob_dict,
                }
        except Exception as e:
            print(f"⚠️ HF Inference API failed, falling back to lexicon: {e}")

    # Fallback: lexicon-based sentiment analysis
    return _lexicon_predict(text)


def _lexicon_predict(text: str) -> dict:
    raw_lower = text.lower()
    raw_words = set(re.findall(r"[a-z]+", raw_lower))
    neg_count = len(raw_words & NEGATIVE_WORDS)
    pos_count = len(raw_words & POSITIVE_WORDS)

    for pw in raw_words & POSITIVE_WORDS:
        for neg in ["not", "no", "never"]:
            if f"{neg} {pw}" in raw_lower:
                pos_count -= 1
                neg_count += 1
    for nw in raw_words & NEGATIVE_WORDS:
        for neg in ["not", "no", "never"]:
            if f"{neg} {nw}" in raw_lower:
                neg_count -= 1
                pos_count += 1

    total = pos_count + neg_count
    if total == 0:
        return {"sentiment": "neutral", "confidence": 0.5, "probabilities": {"neutral": 0.5, "positive": 0.25, "negative": 0.25}}

    pos_ratio = pos_count / total
    neg_ratio = neg_count / total

    if pos_count > neg_count:
        sentiment = "positive"
        confidence = 0.55 + pos_ratio * 0.4
    elif neg_count > pos_count:
        sentiment = "negative"
        confidence = 0.55 + neg_ratio * 0.4
    else:
        sentiment = "neutral"
        confidence = 0.5

    return {
        "sentiment": sentiment,
        "confidence": round(min(confidence, 0.99), 4),
        "probabilities": {
            "positive": round(pos_ratio, 4) if total > 0 else 0.25,
            "negative": round(neg_ratio, 4) if total > 0 else 0.25,
            "neutral": round(1 - pos_ratio - neg_ratio, 4) if total > 0 else 0.5,
        },
    }