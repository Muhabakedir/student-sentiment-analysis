import os
import re
import torch
import numpy as np
from dotenv import load_dotenv

load_dotenv()

# ── LABEL MAPPING ────────────────────────────────────────
# LABEL_0 = negative, LABEL_1 = neutral, LABEL_2 = positive
# Adjust if your training used a different order.
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

# ── GLOBALS ──────────────────────────────────────────────
_model = None
_tokenizer = None

# Hugging Face model name (set in .env or use default)
HF_MODEL_NAME = os.getenv("HF_MODEL_NAME", "cardiffnlp/twitter-roberta-base-sentiment")

# ── CHECK FILES ──────────────────────────────────────────
def model_ready() -> bool:
    return HF_MODEL_NAME is not None

# ── LOAD MODEL SAFELY ─────────────────────────────────────
def _load():
    global _model, _tokenizer

    # Already loaded — skip
    if _model is not None:
        return

    try:
        from transformers import AutoModelForSequenceClassification, AutoTokenizer

        _tokenizer = AutoTokenizer.from_pretrained(HF_MODEL_NAME)
        _model = AutoModelForSequenceClassification.from_pretrained(HF_MODEL_NAME)
        _model.eval()

        print(f"✅ Model loaded from Hugging Face: {HF_MODEL_NAME}")
        print("✅ Labels:", _model.config.id2label)

    except Exception as e:
        print(f"❌ Model loading failed: {e}")
        _model = None

# ── PREDICT ──────────────────────────────────────────────
def predict(text: str) -> dict:

    if not model_ready():
        return {
            "sentiment": "pending",
            "confidence": 0.0,
            "probabilities": {},
            "error": "Model files missing"
        }

    if _model is None:
        _load()

    if _model is None:
        return {
            "sentiment": "error",
            "confidence": 0.0,
            "probabilities": {},
            "error": "Model failed to load"
        }

    try:
        inputs = _tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512)

        with torch.no_grad():
            outputs = _model(**inputs)

        probs = torch.softmax(outputs.logits, dim=-1)[0].cpu().numpy()
        best_idx = int(np.argmax(probs))

        sentiment = ID2LABEL.get(best_idx, f"label_{best_idx}")
        confidence = float(probs[best_idx])

        # ── Lexicon fallback: override when model contradicts obvious words ──
        raw_lower = text.lower()
        raw_words = set(re.findall(r"[a-z]+", raw_lower))
        neg_count = len(raw_words & NEGATIVE_WORDS)
        pos_count = len(raw_words & POSITIVE_WORDS)
        # Check for negation flipping sentiment
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

        # Lexicon override: apply when sentiment words are detected
        # and the model confidence is not very high.
        if neg_count > pos_count and neg_count >= 1 and confidence < 0.90:
            sentiment = "negative"
            confidence = max(confidence, 0.66)
        elif pos_count > neg_count and pos_count >= 1 and confidence < 0.90:
            sentiment = "positive"
            confidence = max(confidence, 0.66)
        elif neg_count == pos_count and neg_count >= 1 and confidence < 0.85:
            sentiment = "neutral"
            confidence = max(confidence, 0.60)

        prob_dict = {
            ID2LABEL.get(i, f"label_{i}"): round(float(p), 4)
            for i, p in enumerate(probs)
        }

        return {
            "sentiment": sentiment,
            "confidence": round(confidence, 4),
            "probabilities": prob_dict,
        }

    except Exception as e:
        return {
            "sentiment": "error",
            "confidence": 0.0,
            "probabilities": {},
            "error": str(e)
        }