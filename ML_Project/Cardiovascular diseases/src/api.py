from pathlib import Path
from typing import Any, Dict, Literal

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = ROOT / "models" / "heart_disease_models.pkl"

app = FastAPI(
    title="Cardiovascular Disease Prediction API",
    version="1.0.0",
    description="Educational screening API wrapping the trained sklearn pipelines from the project notebook.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

MODELS: Dict[str, Any] = {}


def load_models() -> Dict[str, Any]:
    global MODELS
    if not MODELS and MODEL_PATH.exists():
        MODELS = joblib.load(MODEL_PATH)
    return MODELS


class PatientFeatures(BaseModel):
    General_Health: Literal["Poor", "Fair", "Good", "Very Good", "Excellent"]
    Checkup: Literal["Never", "5 or more years ago", "Within the past 5 years", "Within the past 2 years", "Within the past year"]
    Exercise: Literal["Yes", "No"]
    Skin_Cancer: Literal["Yes", "No"]
    Other_Cancer: Literal["Yes", "No"]
    Depression: Literal["Yes", "No"]
    Diabetes: Literal["No", "Yes", "No, pre-diabetes or borderline diabetes", "Yes, but female told only during pregnancy"]
    Arthritis: Literal["Yes", "No"]
    Sex: Literal["Male", "Female"]
    Age_Category: Literal["18-24", "25-29", "30-34", "35-39", "40-44", "45-49", "50-54", "55-59", "60-64", "65-69", "70-74", "75-79", "80+"]
    Height_cm: float = Field(alias="Height_(cm)", gt=0)
    Weight_kg: float = Field(alias="Weight_(kg)", gt=0)
    BMI: float = Field(gt=0)
    Smoking_History: Literal["Yes", "No"]
    Alcohol_Consumption: float = Field(ge=0)
    Fruit_Consumption: float = Field(ge=0)
    Green_Vegetables_Consumption: float = Field(ge=0)
    FriedPotato_Consumption: float = Field(ge=0)

    model_config = {"populate_by_name": True}


def to_frame(features: PatientFeatures) -> pd.DataFrame:
    data = features.model_dump(by_alias=True)
    data["Healthy_Diet_Index"] = data["Fruit_Consumption"] + data["Green_Vegetables_Consumption"]
    data["Unhealthy_Diet_Index"] = data["FriedPotato_Consumption"]
    return pd.DataFrame([data])


@app.get("/health")
def health() -> Dict[str, Any]:
    return {"status": "ok", "models_loaded": bool(load_models()), "model_file": str(MODEL_PATH.name)}


@app.get("/models")
def models() -> Dict[str, Any]:
    loaded = load_models()
    return {"models": list(loaded.keys()), "thresholds": {"Logistic Regression": 0.40, "XGBoost": 0.50, "Random Forest": 0.50}}


@app.post("/predict")
def predict(features: PatientFeatures, model: str = "Logistic Regression") -> Dict[str, Any]:
    loaded = load_models()
    if not loaded:
        raise HTTPException(status_code=503, detail="Model artifact is missing. Add models/heart_disease_models.pkl before serving predictions.")
    if model not in loaded:
        raise HTTPException(status_code=400, detail=f"Unknown model. Choose one of: {', '.join(loaded)}")
    estimator = loaded[model]["model"] if isinstance(loaded[model], dict) else loaded[model]
    threshold = 0.40 if model == "Logistic Regression" else 0.50
    frame = to_frame(features)
    probability = float(estimator.predict_proba(frame)[:, 1][0])
    prediction = int(probability >= threshold)
    return {"model": model, "probability": probability, "threshold": threshold, "prediction": prediction, "label": "Higher screening risk" if prediction else "Lower screening risk", "disclaimer": "Educational screening only; not medical advice or a diagnosis."}
