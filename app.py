from flask import Flask, request, jsonify, send_from_directory
import pandas as pd
import joblib
import os

# ============================================================
# EV CHARGING DEMAND PREDICTION
# FLASK WEB BACKEND
# ============================================================

app = Flask(__name__, static_folder="frontend")


# ============================================================
# LOAD TRAINED ML MODEL
# ============================================================

MODEL_PATH = os.path.join(
    "model",
    "final_ev_charging_demand_model.pkl"
)

model = joblib.load(MODEL_PATH)

print("==============================================")
print("EV CHARGING DEMAND WEB APPLICATION")
print("==============================================")
print("Model loaded successfully!")


# ============================================================
# HOME PAGE
# ============================================================

@app.route("/")
def home():

    return send_from_directory(
        "frontend",
        "index.html"
    )


# ============================================================
# PREDICTION API
# ============================================================

@app.route("/predict", methods=["POST"])
def predict():

    try:

        # Get JSON data from website

        data = request.get_json()

        # ----------------------------------------------------
        # Get input values
        # ----------------------------------------------------

        hour = int(data["hour"])

        temperature = float(
            data["temperature"]
        )

        area = data["area"]

        day_type = data["day_type"]

        ev_arrivals = int(
            data["ev_arrivals"]
        )

        occupancy_rate = float(
            data["occupancy_rate"]
        )

        nearby_event = data["nearby_event"]

        rainfall = float(
            data["rainfall"]
        )

        day_of_week = int(
            data["day_of_week"]
        )

        month = int(
            data["month"]
        )


        # ----------------------------------------------------
        # FEATURE ENGINEERING
        # ----------------------------------------------------

        # Weekend

        if day_of_week >= 5:

            is_weekend = 1

        else:

            is_weekend = 0


        # Time period

        if 5 <= hour < 12:

            time_period = "Morning"

        elif 12 <= hour < 17:

            time_period = "Afternoon"

        elif 17 <= hour < 21:

            time_period = "Evening"

        else:

            time_period = "Night"


        # Arrival per occupancy

        arrival_per_occupancy = (
            ev_arrivals /
            (occupancy_rate + 1)
        )


        # ----------------------------------------------------
        # CREATE MODEL INPUT
        # ----------------------------------------------------

        input_data = pd.DataFrame({

            "Hour": [hour],

            "Temperature": [
                temperature
            ],

            "Area": [area],

            "Day_Type": [
                day_type
            ],

            "EV_Arrivals": [
                ev_arrivals
            ],

            "Occupancy_Rate": [
                occupancy_rate
            ],

            "Nearby_Event": [
                nearby_event
            ],

            "Rainfall": [
                rainfall
            ],

            "Day_of_Week": [
                day_of_week
            ],

            "Month": [
                month
            ],

            "Is_Weekend": [
                is_weekend
            ],

            "Time_Period": [
                time_period
            ],

            "Arrival_per_Occupancy": [
                arrival_per_occupancy
            ]

        })


        # ----------------------------------------------------
        # MAKE PREDICTION
        # ----------------------------------------------------

        prediction = model.predict(
            input_data
        )


        # ----------------------------------------------------
        # CONVERT PREDICTION
        # ----------------------------------------------------

        prediction_mapping = {

            0: "Low",

            1: "Medium",

            2: "High"

        }


        predicted_demand = (
            prediction_mapping[
                int(prediction[0])
            ]
        )


        # ----------------------------------------------------
        # PROBABILITY
        # ----------------------------------------------------

        probabilities = None

        if hasattr(
            model,
            "predict_proba"
        ):

            probability_values = (
                model.predict_proba(
                    input_data
                )[0]
            )

            probabilities = {

                "Low":
                    round(
                        float(
                            probability_values[0]
                        ) * 100,
                        2
                    ),

                "Medium":
                    round(
                        float(
                            probability_values[1]
                        ) * 100,
                        2
                    ),

                "High":
                    round(
                        float(
                            probability_values[2]
                        ) * 100,
                        2
                    )

            }


        # ----------------------------------------------------
        # SEND RESULT TO WEBSITE
        # ----------------------------------------------------

        return jsonify({

            "success": True,

            "prediction":
                predicted_demand,

            "probabilities":
                probabilities

        })


    except Exception as e:

        print(
            "Prediction Error:",
            str(e)
        )

        return jsonify({

            "success": False,

            "error":
                str(e)

        }), 400


# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":

    print(
        "\nStarting Flask server..."
    )

    print(
        "Open this in your browser:"
    )

    print(
        "http://127.0.0.1:5000"
    )

    app.run(
        debug=True
    )