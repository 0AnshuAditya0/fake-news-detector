from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import os

app = FastAPI(title="Fake News Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictRequest(BaseModel):
    text: str

class LinguisticTrigger(BaseModel):
    word: str
    weight: float

class PredictResponse(BaseModel):
    prediction: int
    confidence: float
    triggers: list[LinguisticTrigger]

# Load models for prediction
MODEL_PATH = os.path.join(os.path.dirname(__file__), "custom_fake_news_model.pkl")
VECTORIZER_PATH = os.path.join(os.path.dirname(__file__), "tfidf_vectorizer.pkl")

# We use global variables so they are loaded once
model = None
vectorizer = None

@app.on_event("startup")
def load_models():
    global model, vectorizer
    try:
        model = joblib.load(MODEL_PATH)
        vectorizer = joblib.load(VECTORIZER_PATH)
    except Exception as e:
        print(f"Error loading models: {e}")

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    if not model or not vectorizer:
        raise HTTPException(status_code=500, detail="Models not loaded")

    text = req.text
    if not text.strip():
        return PredictResponse(prediction=0, confidence=0.0, triggers=[])
    
    # Vectorize
    X = vectorizer.transform([text])
    
    # Predict
    pred = model.predict(X)[0]
    proba = model.predict_proba(X)[0]
    confidence = float(max(proba))
    
    # Linguistic Triggers
    feature_names = vectorizer.get_feature_names_out()
    coefs = model.coef_[0]
    
    indices = X.nonzero()[1]
    word_weights = []
    
    # Since we want the highest "Fake" prob weight, let's look at the weights. 
    # If pred==1 means fake, then positive weights contribute to 1.
    for idx in indices:
        word = feature_names[idx]
        weight = float(coefs[idx])
        word_weights.append({"word": word, "weight": weight})
        
    # Sort by absolute weight so we get the most impactful words 
    # (either strongly fake or strongly real)
    word_weights.sort(key=lambda x: abs(x["weight"]), reverse=True)
    
    # Return top 10 triggers
    top_triggers = [LinguisticTrigger(**w) for w in word_weights[:10]]
    
    return PredictResponse(
        prediction=int(pred),
        confidence=confidence,
        triggers=top_triggers
    )
