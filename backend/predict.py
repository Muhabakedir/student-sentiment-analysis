import os
import re
from dotenv import load_dotenv

load_dotenv()

# ── LABEL MAPPING ────────────────────────────────────────
ID2LABEL = {0: "negative", 1: "neutral", 2: "positive"}

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
HF_MODEL_NAME = os.getenv("HF_MODEL_NAME", "cardiffnlp/twitter-roberta-base-sentiment-latest")

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

                if "NEGATIVE" in label.upper():
                    sentiment = "negative"
                elif "POSITIVE" in label.upper():
                    sentiment = "positive"
                else:
                    sentiment = "neutral"

                prob_dict = {}
                for pred in result:
                    pred_label = pred.label
                    if "NEGATIVE" in pred_label.upper():
                        prob_dict["negative"] = round(pred.score, 4)
                    elif "POSITIVE" in pred_label.upper():
                        prob_dict["positive"] = round(pred.score, 4)
                    else:
                        prob_dict["neutral"] = round(pred.score, 4)

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