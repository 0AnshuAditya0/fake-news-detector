# XAI_CORE: Explainable Fake News Detection

**XAI_CORE** is a high-fidelity, decoupled architecture consisting of a Python/FastAPI custom Machine Learning backend and a Next.js 14 frontend. It is designed around the core principle of **Explainable AI (XAI)**—rather than just wrapping a public LLM API, it leverages a rigorously trained local machine learning model with full transparency into its decision-making heuristics.

![Architecture: Decoupled FastAPI + Next.js 14](https://img.shields.io/badge/Architecture-Decoupled-blue)
![Model Accuracy: 96.03%](https://imgshields.io/badge/Accuracy-96.03%25-success)
![Corpus: 72,000+ Samples](https://img.shields.io/badge/Training_Corpus-72k_WELFake_Samples-blueviolet)

---

## The "Resume Cracker" Distinctions

Many portfolio projects simply wrap an OpenAI or Gemini API call for classification. **XAI_CORE** is built differently. It operates on a robust, custom-trained ML pipeline offering granular transparency.

### 1. Custom-Trained 72k+ Dataset Model
This is **NOT** a wrapper for a public API. The core detection engine is a custom **Logistic Regression** model trained on the expansive **WELFake Dataset**, containing over 72,000 diverse news articles.
- **Precision:** 0.97
- **Recall:** 0.97
- **Accuracy:** 96.03%

### 2. Deep Dive Into "Linguistic Triggers" (Explainable AI)
The system goes beyond a deterministic "Fake" or "Real" binary. Because of the linear nature of the Logistic Regression model and its TF-IDF vectorization, XAI_CORE can extract the underlying model coefficients for every word. 
We surface **Linguistic Triggers** directly on the dashboard, showing the user exactly *which* coefficients heavily weighted the final algorithmic decision. Users can see the hidden mechanics of truth verification.

### 3. Multi-Signal Hybrid Analysis
The pipeline supports the ML Engine with robust Rule-Based Heuristics as secondary systems. Our multi-signal approach correlates:
- **ML Core Confidence**
- **Semantic Sentiment Extremes**
- **Bias Indicators**
- **Clickbait Probabilities**
- **Source Domain Verification**

---

## Decoupled Architecture

The project has been refactored for maximum scalability, split between a Python inference layer and a React client layer.

### Frontend: Next.js 14 Client (`/client`)
- **Framework:** Next.js 14 with App Router
- **Design System:** High-contrast "Clinical/Industrial" theme using TailwindCSS and Lucide-React.
- **Experience:** Multi-stage "System Diagnostics" scan and telemetry analysis views.
- **Routes:** 
  - `/` (Telemetry Landing)
  - `/analyze/[id]` (Granular Diagnostics & Linguistic Triggers)
  - `/metrics` (Confusion Matrix & Classification Report)
- **Start Command:** `npm run dev`

### Backend: FastAPI ML Server (`/server`)
- **Framework:** FastAPI
- **Dependencies:** `scikit-learn`, `pydantic`, `uvicorn`
- **Execution:** Loads the locally pickled `tfidf_vectorizer.pkl` and `custom_fake_news_model.pkl`.
- **Endpoint (`/predict`):** Evaluates input text, computes Logistic Regression predict_proba, and maps textual input against raw `.coef_` weights to generate an Array of Linguistic Triggers.
- **Start Command:** `uvicorn main:app --reload`

---

## Setup & Local Development

1. **Clone & Setup Client**
   ```bash
   cd client
   npm install
   npm run dev
   ```

2. **Setup Machine Learning Backend**
   ```bash
   cd server
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

3. **Verify Connection**
   Open `http://localhost:3000` to initiate a Deep Scan. The client will securely beam the textual payload to the local `http://localhost:8000/predict` server for inference and coefficient analysis.

---

> Built for Editorial Precision in an Age of Subjectivity.
