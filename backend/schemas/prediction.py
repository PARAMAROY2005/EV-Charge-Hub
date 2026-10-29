"""
Pydantic Schemas for Request Validation and Response Serialization (Pydantic V2).
"""

from typing import Dict, Any, List, Optional, Literal
from pydantic import BaseModel, Field, ConfigDict


class PredictionRequest(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "hour": 17,
                "temperature": 31.5,
                "area": "Sector V",
                "day_type": "Weekday",
                "ev_arrivals": 95,
                "occupancy_rate": 78.5,
                "nearby_event": "Yes",
                "rainfall": 2.5,
                "day_of_week": 4,
                "month": 7
            }
        }
    )

    hour: int = Field(..., ge=0, le=23, description="Hour of the day (0-23)")
    temperature: float = Field(..., ge=-10.0, le=60.0, description="Ambient temperature in Celsius")
    area: Literal["Salt Lake", "New Town", "Rajarhat", "Park Street", "Sector V"] = Field(
        ..., description="Charging Hub Location"
    )
    day_type: Literal["Weekday", "Weekend"] = Field(..., description="Day classification")
    ev_arrivals: int = Field(..., ge=0, le=500, description="Projected or historical EV arrivals count")
    occupancy_rate: float = Field(..., ge=0.0, le=100.0, description="Charging station occupancy percentage (0-100)")
    nearby_event: Literal["Yes", "No"] = Field(..., description="Flag indicating nearby major event or conference")
    rainfall: float = Field(0.0, ge=0.0, le=200.0, description="Rainfall precipitation in mm")
    day_of_week: int = Field(0, ge=0, le=6, description="Day of week (0=Monday, 6=Sunday)")
    month: int = Field(6, ge=1, le=12, description="Month of the year (1-12)")


class EngineeredFeatures(BaseModel):
    time_period: str
    is_weekend: bool
    arrival_per_occupancy: float


class PredictionResponse(BaseModel):
    success: bool = True
    predicted_demand: str
    confidence: float
    probabilities: Dict[str, float]
    recommendation: str
    engineered_features: EngineeredFeatures
    record_id: Optional[int] = None


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    version: str
    dataset_records: int


class HistoryItem(BaseModel):
    id: int
    timestamp: str
    hour: int
    temperature: float
    area: str
    day_type: str
    ev_arrivals: int
    occupancy_rate: float
    nearby_event: str
    rainfall: float
    day_of_week: int
    month: int
    predicted_demand: str
    confidence: float
    probabilities: Dict[str, float]
    recommendation: Optional[str] = None
