"""
Command-line and module helper for EV Charging Demand inference.
"""

from backend.ml.pipeline import EVModelPipeline


def predict_demand(
    hour: int,
    temperature: float,
    area: str,
    day_type: str,
    ev_arrivals: int,
    occupancy_rate: float,
    nearby_event: str,
    rainfall: float = 0.0,
    day_of_week: int = 0,
    month: int = 6
):
    pipeline = EVModelPipeline.get_instance()
    payload = {
        "hour": hour,
        "temperature": temperature,
        "area": area,
        "day_type": day_type,
        "ev_arrivals": ev_arrivals,
        "occupancy_rate": occupancy_rate,
        "nearby_event": nearby_event,
        "rainfall": rainfall,
        "day_of_week": day_of_week,
        "month": month
    }
    return pipeline.predict(payload)


if __name__ == "__main__":
    import json
    print("Testing programmatic prediction:")
    sample = {
        "hour": 18,
        "temperature": 32.0,
        "area": "Sector V",
        "day_type": "Weekday",
        "ev_arrivals": 110,
        "occupancy_rate": 85.0,
        "nearby_event": "Yes",
        "rainfall": 0.0,
        "day_of_week": 4,
        "month": 8
    }
    res = predict_demand(**sample)
    print(json.dumps(res, indent=2))
