import pandas as pd
import numpy as np
import os
import sys
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression  
from sklearn.pipeline import Pipeline
import pickle
import json

def train_and_export():
    print("🚀 Starting Fake News Model Training")
    
    data_path = 'ml/WELFake_Dataset.csv'
    
    if not os.path.exists(data_path):
        print(f"❌ Error: Dataset not found at {data_path}")
        sys.exit(1)

    print("📊 Loading dataset...")
    df = pd.read_csv(data_path)
    

    df = df.fillna('')
    df['text'] = df['title'] + " " + df['text']
    
    X = df['text']
    y = df['label']
    
    print(f"📈 Dataset size: {len(X)} rows")
    print(f"   Real: {sum(y==1)}, Fake: {sum(y==0)}")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    
    print("🔤 Building TF-IDF + Logistic Regression pipeline...")
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=5000, ngram_range=(1, 2), stop_words='english')),
        ('clf', LogisticRegression(max_iter=1000, C=1.0, n_jobs=-1))
    ])
    

    print("🧠 Training model...")
    import time
    start = time.time()
    pipeline.fit(X_train, y_train)
    print(f"   ✓ Training done in {time.time()-start:.1f}s")

    
    print("📊 Evaluating...")
    accuracy = pipeline.score(X_test, y_test)
    print(f"✅ Test Accuracy: {accuracy*100:.2f}%")
    
    from sklearn.metrics import classification_report
    y_pred = pipeline.predict(X_test)
    print("\n" + classification_report(y_test, y_pred, target_names=['Fake', 'Real']))

    
    os.makedirs("public/models", exist_ok=True)

    print("\n📦 Saving model as pickle...")
    with open("public/models/fake_news_model.pkl", "wb") as f:
        pickle.dump(pipeline, f)
    print("✅ Model saved to public/models/fake_news_model.pkl")
    
    
    vocab = pipeline.named_steps['tfidf'].get_feature_names_out()
    vocab_dict = {word: idx for idx, word in enumerate(vocab)}
    
    with open("public/models/vocabulary.json", "w") as f:
        json.dump({
            'vocabulary': list(vocab_dict.keys()),
            'feature_count': len(vocab_dict)
        }, f)
    print("✅ Vocabulary saved")
    
    print(f"\n🎉 Done! Accuracy: {accuracy*100:.2f}%")

if __name__ == "__main__":
    try:
        train_and_export()
    except KeyboardInterrupt:
        print("\n⚠️ Interrupted")
        sys.exit(1)