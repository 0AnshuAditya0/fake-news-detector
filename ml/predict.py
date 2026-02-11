#!/usr/bin/env python3
import sys
import pickle
import json
import warnings
warnings.filterwarnings('ignore')

MODEL_PATH = 'public/models/fake_news_model.pkl'

def predict(text):
    try:
        
        with open(MODEL_PATH, 'rb') as f:
            model = pickle.load(f)
        

        prediction = model.predict([text])[0]
        probabilities = model.predict_proba([text])[0]
        confidence = max(probabilities)
        
        
        result = {
            'prediction': int(prediction),
            'confidence': float(confidence)
        }
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({
            'prediction': 0,
            'confidence': 0.5,
            'error': str(e)
        }), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python predict.py "text to analyze"', file=sys.stderr)
        sys.exit(1)
    
    text = sys.argv[1]
    predict(text)