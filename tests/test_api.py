"""
Automated unit and integration tests for EV Charging Demand Prediction API.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.ml.pipeline import EVModelPipeline, derive_time_period

client = TestClient(app)


def test_derive_time_period():
    assert derive_time_period(7) == "Morning"
    assert derive_time_period(14) == "Afternoon"
    assert derive_time_period(19) == "Evening"
    assert derive_time_period(23) == "Night"
    assert derive_time_period(2) == "Night"


def test_model_pipeline_loads():
    pipeline = EVModelPipeline.get_instance()
    assert pipeline.is_loaded() is True
    assert pipeline.model is not None


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert data["dataset_records"] >= 1000


def test_model_info_endpoint():
    response = client.get("/api/model-info")
    assert response.status_code == 200
    data = response.json()
    assert "algorithm" in data
    assert "metrics" in data
    assert "accuracy" in data["metrics"]
    assert data["metrics"]["accuracy"] > 70.0  # Real accuracy is ~76.7%
    assert "confusion_matrix" in data


def test_analytics_endpoint():
    response = client.get("/api/analytics")
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "demand_distribution" in data
    assert "hourly_trends" in data
    assert len(data["demand_distribution"]) == 3


def test_predict_endpoint_valid():
    payload = {
        "hour": 18,
        "temperature": 30.5,
        "area": "Sector V",
        "day_type": "Weekday",
        "ev_arrivals": 90,
        "occupancy_rate": 75.0,
        "nearby_event": "Yes",
        "rainfall": 0.0,
        "day_of_week": 3,
        "month": 8
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["predicted_demand"] in ["Low", "Medium", "High"]
    assert "probabilities" in data
    assert "Low" in data["probabilities"]
    assert "Medium" in data["probabilities"]
    assert "High" in data["probabilities"]
    assert "recommendation" in data
    assert data["record_id"] is not None


def test_predict_endpoint_validation_error():
    # Invalid hour (25) and invalid area ("Unknown Area")
    payload = {
        "hour": 25,
        "temperature": 30.5,
        "area": "Invalid Area",
        "day_type": "Weekday",
        "ev_arrivals": 90,
        "occupancy_rate": 75.0,
        "nearby_event": "Yes"
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 422  # Unprocessable Entity (Pydantic validation)


def test_history_endpoints():
    # Fetch history
    response = client.get("/api/history?limit=10")
    assert response.status_code == 200
    items = response.json()
    assert isinstance(items, list)
    assert len(items) > 0

    latest_id = items[0]["id"]

    # Delete single item
    del_res = client.delete(f"/api/history/{latest_id}")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True
