# CardioSense — Cardiovascular Disease Prediction

[![Deploy GitHub Pages](https://github.com/ibrahimalropy/BNS_AIS2_S2_ML/actions/workflows/ml-project-pages.yml/badge.svg)](https://github.com/ibrahimalropy/BNS_AIS2_S2_ML/actions/workflows/ml-project-pages.yml) [Open on GitHub Pages](https://ibrahimalropy.github.io/BNS_AIS2_S2_ML/)

**CardioSense** is an educational machine-learning project for binary cardiovascular-disease screening. It converts the original research notebook into a documented, reproducible repository and exposes the saved scikit-learn pipelines through a FastAPI endpoint.

> **Medical disclaimer:** This project is for learning, prototyping, and screening research only. It is not a clinical device, diagnosis, treatment recommendation, or substitute for a qualified healthcare professional.

## Live links

| Resource | Link |
|---|---|
| GitHub Actions workflow | [Actions](https://github.com/ibrahimalropy/BNS_AIS2_S2_ML/actions) |
| GitHub Pages project landing page | `https://ibrahimalropy.github.io/BNS_AIS2_S2_ML/` after the first successful deployment |
| API documentation when running locally | `http://127.0.0.1:8000/docs` |


## Project structure

```text
ML_Project/
├── Cardiovascular diseases/
│   ├── notebooks/
│   │   └── Project_classification.ipynb   # original research notebook
│   ├── src/
│   │   ├── api.py                          # FastAPI prediction service
│   │   └── example_request.json             # valid request body
│   ├── models/
│   │   ├── heart_disease_models.pkl         # generated locally; not committed by default
│   │   └── .gitkeep
│   ├── data/
│   │   └── .gitkeep                         # place CVD_cleaned.csv here locally
│   └── requirements.txt
├── docs/index.html                          # GitHub Pages landing page
└── .github/workflows/pages.yml              # automatic Pages deployment
```

## Problem definition

The target is `Heart_Disease`, originally encoded as `Yes` or `No` and converted to `1` or `0`. The input is tabular health, demographic, clinical-history, and lifestyle information. The positive class is relatively uncommon (approximately 8% in the reported dataset), so accuracy alone is misleading: a model that always predicts “No” can appear accurate while missing the cases that matter most.

The notebook uses a recall-conscious screening approach. It applies a stratified 80/20 split, masks implausible heights and weights, removes exact duplicates, engineers diet indices, imputes missing numeric values, applies robust scaling, log-transforms selected consumption variables, ordinal-encodes ordered health fields, and one-hot-encodes nominal fields.

## Models

Three tuned pipelines are saved in `heart_disease_models.pkl`:

| Model | Intended use in the project |
|---|---|
| Logistic Regression | Interpretable baseline and recall-oriented screening; the live UI uses a lower threshold of 0.40 |
| XGBoost | Captures nonlinear relationships and is useful for ranking/overall discrimination |
| Random Forest | Stable ensemble baseline for tabular data |

The notebook selects hyperparameters using `GridSearchCV` with F1 scoring and three-fold cross-validation. Reported values in the supplied deployment page include ROC-AUC around 0.839 and positive-class recall around 0.799 for the recall-tuned logistic model. Re-run the notebook on the exact dataset to reproduce or update these values.

## Dataset

The notebook expects a cleaned BRFSS-derived CSV named `CVD_cleaned.csv` with a `Heart_Disease` target. The raw dataset is intentionally not included in this repository because it is large and may have separate distribution/licensing conditions. Put it under `Cardiovascular diseases/data/` locally, or update the notebook path before training.

Expected core fields are:

`General_Health`, `Checkup`, `Exercise`, `Heart_Disease`, `Skin_Cancer`, `Other_Cancer`, `Depression`, `Diabetes`, `Arthritis`, `Sex`, `Age_Category`, `Height_(cm)`, `Weight_(kg)`, `BMI`, `Smoking_History`, `Alcohol_Consumption`, `Fruit_Consumption`, `Green_Vegetables_Consumption`, and `FriedPotato_Consumption`.

## Reproduce training

```bash
cd "Cardiovascular diseases"
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
```

Open `notebooks/Project_classification.ipynb`, change the Windows-specific `Data_path` to your local `data/CVD_cleaned.csv`, and run the notebook. The final cell writes:

```text
Cardiovascular diseases/models/heart_disease_models.pkl
```

Do not commit private patient-level data or secrets. For a production artifact, use a secure model registry or encrypted artifact storage and pin dependency versions.

## Run the API locally

After training and generating the model bundle:

```bash
cd "Cardiovascular diseases"
uvicorn src.api:app --reload --host 0.0.0.0 --port 8000
```

Test service health and model availability:

```bash
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8000/models
```

Send a prediction request:

```bash
curl -X POST "http://127.0.0.1:8000/predict?model=Logistic%20Regression" \
  -H "Content-Type: application/json" \
  --data @src/example_request.json
```

The response includes a probability, the applied threshold, a binary prediction, and a safety disclaimer. If the model artifact is absent, the API intentionally returns HTTP 503 instead of producing a fake prediction.

## GitHub Actions and deployment link

`.github/workflows/ml-project-pages.yml` publishes the small landing page in `docs/` to GitHub Pages on every push to `main`. This gives the repository a stable project URL and a clear link to the already deployed CardioSense interface. GitHub Pages does **not** run the Python model server; to expose the real `/predict` endpoint publicly, deploy the FastAPI service to a Python-capable host and configure the front end to call that API URL.

The included API is ready for a host such as Render, Railway, Fly.io, or a comparable service, but this repository does not contain provider credentials or automatically create external infrastructure. Never put API keys in GitHub files; use repository/environment secrets.

## Limitations and responsible use

The model learns associations from survey responses rather than direct clinical measurements. Dataset shift, missing variables, reporting bias, class imbalance, calibration error, and demographic subgroup performance can all affect results. Thresholds should be selected with a clinical validation protocol, and every real-world use requires privacy, security, fairness, monitoring, and professional medical governance.

## License

No license has been asserted yet. Add a license that matches the dataset terms and your intended reuse policy before distributing this repository as open source.

## العربية — ملخص سريع

هذا المشروع يتنبأ باحتمالية وجود مؤشرات لخطر أمراض القلب باستخدام بيانات استبيان صحية ونماذج Logistic Regression وXGBoost وRandom Forest. النتيجة **ليست تشخيصًا طبيًا**. افتح صفحة المشروع من GitHub Pages أو شغّل الـ API محليًا حسب التعليمات. لتشغيل الـ API محليًا، ضع ملف `heart_disease_models.pkl` داخل مجلد `models` ثم شغّل أمر `uvicorn` الموضح أعلاه.
