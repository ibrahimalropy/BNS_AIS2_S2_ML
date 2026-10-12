from pathlib import Path
from typing import Literal
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = ROOT / "models" / "medical_charges_pipeline.joblib"
app = FastAPI(title="Medical Charges Prediction API", version="1.0.0",
               description="Educational regression demo for annual insurance-charge estimates.")
MODEL = None

class Policyholder(BaseModel):
    age: int = Field(ge=18, le=100)
    sex: Literal["female", "male"]
    bmi: float = Field(gt=0, le=100)
    children: int = Field(ge=0, le=20)
    smoker: Literal["yes", "no"]
    region: Literal["northeast", "northwest", "southeast", "southwest"]

@app.get("/health")
def health():
    return {"status": "ok", "model_available": MODEL_PATH.exists()}

@app.post("/predict")
def predict(profile: Policyholder):
    global MODEL
    if MODEL is None:
        if not MODEL_PATH.exists():
            raise HTTPException(status_code=503, detail="Model missing. Run the notebook first to create models/medical_charges_pipeline.joblib.")
        MODEL = joblib.load(MODEL_PATH)
    row = profile.model_dump()
    row["risk"] = int(row["bmi"] >= 30 and row["smoker"] == "yes")
    estimate = float(MODEL.predict(pd.DataFrame([row]))[0])
    return {"estimated_annual_charges": round(estimate, 2), "currency": "USD",
            "disclaimer": "Educational estimate only; not an insurance quote or financial advice."}
