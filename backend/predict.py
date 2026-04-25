import os
import re
import requests
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
HF_API_URL = os.getenv("HF_API_URL", "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment")
HF_API_TOKEN = os.getenv("HF_API_TOKEN", "")

# ── CHECK API READY ────────────────────────────────────────
def model_ready() -> bool:
    return HF_API_URL is not None and HF_API_TOKEN is not None

# ── PREDICT USING HUGGING FACE API ─────────────────────────
def predict(text: str) -> dict:
    if not model_ready():
        return {
            "sentiment": "pending",
            "confidence": 0.0,
            "probabilities": {},
            "error": "Hugging Face API not configured"
        }

    try:
        headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}
        response = requests.post(HF_API_URL, headers=headers, json={"inputs": text}, timeout=10)
        print(f"🔍 HF API Response Status: {response.status_code}")
        print(f"🔍 HF API Response: {response.text[:500]}")
        response.raise_for_status()
        
        result = response.json()
        
        if isinstance(result, list) and len(result) > 0:
            predictions = result[0]
            if isinstance(predictions, list):
                best_pred = max(predictions, key=lambda x: x.get("score", 0))
                label = best_pred.get("label", "unknown")
                confidence = best_pred.get("score", 0.0)
                
                if "NEGATIVE" in label.upper():
                    sentiment = "negative"
                elif "POSITIVE" in label.upper():
                    sentiment = "positive"
                else:
                    sentiment = "neutral"
                
                prob_dict = {}
                for pred in predictions:
                    pred_label = pred.get("label", "unknown")
                    if "NEGATIVE" in pred_label.upper():
                        prob_dict["negative"] = round(pred.get("score", 0.0), 4)
                    elif "POSITIVE" in pred_label.upper():
                        prob_dict["positive"] = round(pred.get("score", 0.0), 4)
                    else:
                        prob_dict["neutral"] = round(pred.get("score", 0.0), 4)
                
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
                
                if neg_count > pos_count and neg_count >= 1 and confidence < 0.90:
                    sentiment = "negative"
                    confidence = max(confidence, 0.66)
                elif pos_count > neg_count and pos_count >= 1 and confidence < 0.90:
                    sentiment = "positive"
                    confidence = max(confidence, 0.66)
                elif neg_count == pos_count and neg_count >= 1 and confidence < 0.85:
                    sentiment = "neutral"
                    confidence = max(confidence, 0.60)
                
                return {
                    "sentiment": sentiment,
                    "confidence": round(confidence, 4),
                    "probabilities": prob_dict,
                }
        
        return {
            "sentiment": "error",
            "confidence": 0.0,
            "probabilities": {},
            "error": "Unexpected API response format"
        }

    except requests.exceptions.RequestException as e:
        return {
            "sentiment": "error",
            "confidence": 0.0,
            "probabilities": {},
            "error": f"API request failed: {str(e)}"
        }
    except Exception as e:
        return {
            "sentiment": "error",
            "confidence": 0.0,
            "probabilities": {},
            "error": str(e)
        }