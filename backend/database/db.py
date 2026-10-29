"""
SQLite Database module for persistent EV Charging Demand prediction history.
Easily upgradeable to PostgreSQL via environment variables.
"""

import sqlite3
import json
import os
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

DB_DIR = Path("/tmp") if os.environ.get("VERCEL") else Path(__file__).resolve().parent
DB_PATH = DB_DIR / "predictions.db"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initializes the database schema if not present."""
    with get_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS prediction_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                hour INTEGER NOT NULL,
                temperature REAL NOT NULL,
                area TEXT NOT NULL,
                day_type TEXT NOT NULL,
                ev_arrivals INTEGER NOT NULL,
                occupancy_rate REAL NOT NULL,
                nearby_event TEXT NOT NULL,
                rainfall REAL NOT NULL,
                day_of_week INTEGER NOT NULL,
                month INTEGER NOT NULL,
                predicted_demand TEXT NOT NULL,
                confidence REAL NOT NULL,
                probabilities_json TEXT,
                recommendation TEXT
            );
        """)
        conn.commit()


# Auto-initialize on module load
init_db()


def save_prediction(input_data: Dict[str, Any], result: Dict[str, Any]) -> int:
    """Saves a prediction entry to SQLite and returns the new ID."""
    timestamp = datetime.now(timezone.utc).isoformat()
    probs_json = json.dumps(result.get("probabilities", {}))

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO prediction_history (
                timestamp, hour, temperature, area, day_type,
                ev_arrivals, occupancy_rate, nearby_event, rainfall,
                day_of_week, month, predicted_demand, confidence,
                probabilities_json, recommendation
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            timestamp,
            int(input_data["hour"]),
            float(input_data["temperature"]),
            str(input_data["area"]),
            str(input_data["day_type"]),
            int(input_data["ev_arrivals"]),
            float(input_data["occupancy_rate"]),
            str(input_data["nearby_event"]),
            float(input_data.get("rainfall", 0.0)),
            int(input_data.get("day_of_week", 0)),
            int(input_data.get("month", 1)),
            str(result["predicted_demand"]),
            float(result.get("confidence", 0.0)),
            probs_json,
            str(result.get("recommendation", ""))
        ))
        conn.commit()
        return cursor.lastrowid


def get_history(
    limit: int = 100,
    offset: int = 0,
    area: Optional[str] = None,
    demand: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Retrieves prediction history with optional filters."""
    query = "SELECT * FROM prediction_history WHERE 1=1"
    params = []

    if area and area.strip():
        query += " AND area = ?"
        params.append(area.strip())

    if demand and demand.strip():
        query += " AND predicted_demand = ?"
        params.append(demand.strip())

    query += " ORDER BY id DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(query, params)
        rows = cursor.fetchall()

    history = []
    for r in rows:
        probs = {}
        if r["probabilities_json"]:
            try:
                probs = json.loads(r["probabilities_json"])
            except Exception:
                probs = {}

        history.append({
            "id": r["id"],
            "timestamp": r["timestamp"],
            "hour": r["hour"],
            "temperature": r["temperature"],
            "area": r["area"],
            "day_type": r["day_type"],
            "ev_arrivals": r["ev_arrivals"],
            "occupancy_rate": r["occupancy_rate"],
            "nearby_event": r["nearby_event"],
            "rainfall": r["rainfall"],
            "day_of_week": r["day_of_week"],
            "month": r["month"],
            "predicted_demand": r["predicted_demand"],
            "confidence": r["confidence"],
            "probabilities": probs,
            "recommendation": r["recommendation"]
        })

    return history


def delete_prediction(prediction_id: int) -> bool:
    """Deletes a specific prediction record."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM prediction_history WHERE id = ?", (prediction_id,))
        conn.commit()
        return cursor.rowcount > 0


def clear_all_history() -> int:
    """Clears all records from prediction history."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM prediction_history")
        conn.commit()
        return cursor.rowcount
