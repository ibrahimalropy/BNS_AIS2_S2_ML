# Medical Charges Prediction

An end-to-end machine-learning project that estimates annual medical insurance charges from a policyholder profile. It mirrors the repository’s **Cardiovascular Disease Prediction** layout: dataset, notebook, saved-model location, API, and a small project landing page.

**Live demo:** [MediCharge · AI](https://medcharges-ptpyks8q.manus.space)

## Project contents

- `data/insurance.csv` — the 1,338-row insurance dataset.
- `notebooks/Medical_Charges_Prediction.ipynb` — EDA, feature engineering, train/test split, preprocessing, cross-validated tuning, evaluation, and model export.
- `notebooks/Project.ipynb` — the original notebook file provided with the project.
- `src/api.py` — FastAPI prediction endpoint.
- `models/` — destination for the generated model artifact (not committed).
- `docs/index.html` — project landing page and reference demo link.

## Run locally

From this project folder, install dependencies and open the runnable, path-adjusted notebook:

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
jupyter notebook notebooks/Medical_Charges_Prediction.ipynb
```

Run all notebook cells once to create `models/medical_charges_pipeline.joblib`. Then start the API from this folder:

```bash
uvicorn src.api:app --reload
```

Interactive API docs: `http://127.0.0.1:8000/docs`. Example request body: `src/example_request.json`. The `/health` endpoint reports whether the model file is available.

## Dataset

The CSV is the public Medical Cost Personal dataset mirrored at [stedy/Machine-Learning-with-R-datasets](https://github.com/stedy/Machine-Learning-with-R-datasets/blob/master/insurance.csv). It includes age, sex, BMI, children, smoker, region, and annual charges.

## Reference demo

The supplied live reference is [MediCharge · AI](https://medcharges-ptpyks8q.manus.space). This repository provides the reproducible notebook and an API starter; it does not copy or claim ownership of the reference site's source code.

## Important note

Predictions are approximate educational estimates based on a small sample dataset. They are not insurance quotes, medical assessments, or financial advice.
