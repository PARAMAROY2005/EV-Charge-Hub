"""
EV Charging Demand Prediction - ML Pipeline Module
Handles model loading, feature engineering, input validation, and inference.
"""

import os
from pathlib import Path
from typing import Dict, Any, Tuple, Optional
import pandas as pd
import numpy as np
import joblib

# Paths to search for the trained model artifact
POSSIBLE_MODEL_PATHS = [
    Path(__file__).resolve().parent.parent.parent / "models" / "final_ev_charging_demand_model.pkl",
    Path(__file__).resolve().parent.parent.parent / "model" / "final_ev_charging_demand_model.pkl",
    Path(__file__).resolve().parent.parent.parent / "final_ev_charging_demand_model.pkl",
]

TARGET_MAP = {
    0: "Low",
    1: "Medium",
    2: "High"
}

VALID_AREAS = ["Salt Lake", "New Town", "Rajarhat", "Park Street", "Sector V"]
VALID_DAY_TYPES = ["Weekday", "Weekend"]
VALID_NEARBY_EVENTS = ["Yes", "No"]


def derive_time_period(hour: int) -> str:
    """Derive time period category from hour of day (0-23)."""
    if 5 <= hour < 12:
        return "Morning"
    elif 12 <= hour < 17:
        return "Afternoon"
    elif 17 <= hour < 21:
        return "Evening"
    else:
        return "Night"


class EVModelPipeline:
    """Singleton wrapper for the trained Scikit-learn Pipeline."""
    _instance: Optional["EVModelPipeline"] = None

    def __init__(self):
        self.model = None
        self.model_path = None
        self._load_model()

    @classmethod
    def get_instance(cls) -> "EVModelPipeline":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _load_model(self):
        """Locates and loads the persisted model pipeline."""
        for path in POSSIBLE_MODEL_PATHS:
            if path.exists():
                self.model = joblib.load(path)
                self.model_path = str(path)
                print(f"[ML Pipeline] Loaded trained model artifact from: {path}")
                return
        print("[ML Pipeline] WARNING: No trained model file found in search paths!")

    def is_loaded(self) -> bool:
        return self.model is not None

    def preprocess_input(self, raw_data: Dict[str, Any]) -> pd.DataFrame:
        """
        Validates and engineers the exact features expected by the scikit-learn pipeline.
        Required columns in order:
        ['Hour', 'Temperature', 'Area', 'Day_Type', 'EV_Arrivals', 'Occupancy_Rate',
         'Nearby_Event', 'Rainfall', 'Day_of_Week', 'Month', 'Is_Weekend',
         'Time_Period', 'Arrival_per_Occupancy']
        """
        hour = int(raw_data["hour"])
        temperature = float(raw_data["temperature"])
        area = str(raw_data["area"]).strip()
        day_type = str(raw_data["day_type"]).strip()
        ev_arrivals = int(raw_data["ev_arrivals"])
        occupancy_rate = float(raw_data["occupancy_rate"])
        nearby_event = str(raw_data["nearby_event"]).strip()
        rainfall = float(raw_data.get("rainfall", 0.0))

        # Date handling / defaults
        day_of_week = int(raw_data.get("day_of_week", 0))  # 0=Monday, 6=Sunday
        month = int(raw_data.get("month", 6))  # 1-12

        # Inferred / engineered features
        # If day_of_week indicates weekend, align Day_Type or Is_Weekend
        is_weekend = 1 if (day_of_week >= 5 or day_type.lower() == "weekend") else 0
        if is_weekend == 1:
            day_type = "Weekend"
        else:
            day_type = "Weekday"

        time_period = derive_time_period(hour)
        arrival_per_occupancy = float(ev_arrivals / (occupancy_rate + 1.0))

        df_input = pd.DataFrame([{
            "Hour": hour,
            "Temperature": temperature,
            "Area": area,
            "Day_Type": day_type,
            "EV_Arrivals": ev_arrivals,
            "Occupancy_Rate": occupancy_rate,
            "Nearby_Event": nearby_event,
            "Rainfall": rainfall,
            "Day_of_Week": day_of_week,
            "Month": month,
            "Is_Weekend": is_weekend,
            "Time_Period": time_period,
            "Arrival_per_Occupancy": arrival_per_occupancy
        }])

        return df_input

    def predict(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Runs inference through the full Scikit-Learn pipeline.
        Returns predicted category, probabilities, confidence, and operational recommendation.
        """
        if not self.is_loaded():
            raise RuntimeError("Model is not loaded. Ensure final_ev_charging_demand_model.pkl exists.")

        df_features = self.preprocess_input(raw_data)

        # Raw prediction
        pred_class_idx = int(self.model.predict(df_features)[0])
        predicted_demand = TARGET_MAP.get(pred_class_idx, "Unknown")

        # Probabilities
        probabilities = {}
        confidence = 0.0
        if hasattr(self.model, "predict_proba"):
            probs = self.model.predict_proba(df_features)[0]
            probabilities = {
                "Low": round(float(probs[0]) * 100, 2),
                "Medium": round(float(probs[1]) * 100, 2),
                "High": round(float(probs[2]) * 100, 2),
            }
            confidence = probabilities.get(predicted_demand, 0.0)

        # Operational recommendation based on real domain factors
        recommendation = self._generate_recommendation(
            predicted_demand=predicted_demand,
            occupancy=raw_data["occupancy_rate"],
            arrivals=raw_data["ev_arrivals"],
            area=raw_data["area"]
        )

        return {
            "predicted_demand": predicted_demand,
            "predicted_class_index": pred_class_idx,
            "confidence": confidence,
            "probabilities": probabilities,
            "recommendation": recommendation,
            "engineered_features": {
                "time_period": df_features["Time_Period"].iloc[0],
                "is_weekend": bool(df_features["Is_Weekend"].iloc[0]),
                "arrival_per_occupancy": round(df_features["Arrival_per_Occupancy"].iloc[0], 3)
            }
        }

    def _generate_recommendation(self, predicted_demand: str, occupancy: float, arrivals: int, area: str) -> str:
        if predicted_demand == "High":
            return (
                f"Peak charging demand expected at {area}. "
                f"Prepare rapid DC fast chargers, dispatch auxiliary grid reserve, "
                f"and activate slot scheduling to avoid station queues."
            )
        elif predicted_demand == "Medium":
            return (
                f"Moderate charging demand projected for {area}. "
                f"Standard operational profile recommended. Ensure all charging dispensers "
                f"remain online with dynamic load balancing active."
            )
        else:
            return (
                f"Low charging demand anticipated at {area}. "
                f"Optimal window for off-peak preventative maintenance, "
                f"firmware updates, or offering dynamic off-peak tariff discounts."
            )
