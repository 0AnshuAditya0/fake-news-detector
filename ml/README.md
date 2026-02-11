# 🧠 Custom ML Model Training

Follow these steps to train and export your own XGBoost model for fake news detection.

## 1. Prerequisites
You need Python 3.8+ installed. Install the required libraries:

```bash
pip install pandas numpy scikit-learn xgboost skl2onnx onnx onnxruntime
```

## 2. Get the Dataset
1. Download the **WELFake Dataset** from Kaggle: [Kaggle WELFake Dataset](https://www.kaggle.com/datasets/saurabhshahane/fake-news-classification)
2. Unzip it and place the `WELFake_Dataset.csv` file inside this `ml/` folder.

## 3. Train and Export
Run the training script:

```bash
python ml/train_xgboost.py
```

This will:
- Load the 72k articles.
- Train an XGBoost model.
- Export it to `public/models/fake_news_model.onnx`.

## 4. Integration
Once the `.onnx` file is generated, the Next.js app will automatically detect it and use it as a fallback when Gemini is unavailable or for multi-signal verification.
