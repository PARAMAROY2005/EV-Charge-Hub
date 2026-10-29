"""
FastAPI Routes for EV Charging Demand Prediction.
"""

from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query, status
from backend.schemas.prediction import (
    PredictionRequest,
    PredictionResponse,
    HealthResponse,
    HistoryItem
)
from backend.ml.pipeline import EVModelPipeline
from backend.services.analytics import AnalyticsService
from backend.database.db import save_prediction, get_history, clear_all_history, delete_prediction

router = APIRouter(prefix="/api", tags=["EV Demand"])


@router.get("/health", response_model=HealthResponse)
def check_health():
    """Returns application and model pipeline health status."""
    pipeline = EVModelPipeline.get_instance()
    analytics_svc = AnalyticsService.get_instance()
    summary = analytics_svc.get_analytics().get("summary", {})

    return HealthResponse(
        status="healthy" if pipeline.is_loaded() else "degraded",
        model_loaded=pipeline.is_loaded(),
        version="2.0.0",
        dataset_records=summary.get("total_records", 10000)
    )


@router.get("/model-info")
def get_model_information():
    """Retrieves model architecture, hyperparameters, and verified evaluation metrics."""
    analytics_svc = AnalyticsService.get_instance()
    info = analytics_svc.get_model_info()
    if not info:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model evaluation metrics are not available"
        )
    return info


@router.get("/analytics")
def get_dataset_analytics():
    """Provides aggregated dataset statistics, hourly patterns, and correlation matrices."""
    analytics_svc = AnalyticsService.get_instance()
    data = analytics_svc.get_analytics()
    if not data:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Dataset analytics not available"
        )
    return data


@router.post("/predict", response_model=PredictionResponse)
def generate_prediction(request: PredictionRequest):
    """
    Executes real-time machine learning inference for EV charging demand.
    Engineers necessary features, passes them into the Scikit-learn Pipeline,
    persists the prediction into SQLite, and returns probabilities.
    """
    pipeline = EVModelPipeline.get_instance()
    if not pipeline.is_loaded():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Trained ML model pipeline is not loaded on the server"
        )

    try:
        raw_dict = request.model_dump()
        result = pipeline.predict(raw_dict)

        # Persist to database
        record_id = save_prediction(raw_dict, result)

        return PredictionResponse(
            success=True,
            predicted_demand=result["predicted_demand"],
            confidence=result["confidence"],
            probabilities=result["probabilities"],
            recommendation=result["recommendation"],
            engineered_features=result["engineered_features"],
            record_id=record_id
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Inference pipeline execution error: {str(e)}"
        )


@router.get("/history", response_model=List[HistoryItem])
def list_prediction_history(
    limit: int = Query(50, ge=1, le=200, description="Max records to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    area: Optional[str] = Query(None, description="Filter by charging hub area"),
    demand: Optional[str] = Query(None, description="Filter by predicted demand class (Low, Medium, High)")
):
    """Returns stored prediction history with optional filtering."""
    try:
        return get_history(limit=limit, offset=offset, area=area, demand=demand)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch prediction history: {str(e)}"
        )


@router.delete("/history/{record_id}")
def delete_single_history(record_id: int):
    """Deletes a single prediction entry from history."""
    success = delete_prediction(record_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"History record with ID {record_id} not found"
        )
    return {"success": True, "message": f"Record {record_id} deleted"}


@router.delete("/history")
def clear_all_predictions():
    """Clears all stored prediction history."""
    count = clear_all_history()
    return {"success": True, "deleted_count": count, "message": "History cleared successfully"}
