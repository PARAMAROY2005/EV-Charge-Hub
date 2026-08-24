import pandas as pd
import joblib


# ============================================================
# EV CHARGING DEMAND PREDICTION SYSTEM
# User Input Prediction
# ============================================================


# ============================================================
# LOAD TRAINED MODEL
# ============================================================

model = joblib.load(
    "final_ev_charging_demand_model.pkl"
)

print("==============================================")
print("   EV CHARGING DEMAND PREDICTION SYSTEM")
print("==============================================")

print("\nModel loaded successfully!")


# ============================================================
# USER INPUT
# ============================================================

print("\n==============================================")
print("              ENTER INPUT DATA")
print("==============================================")


# ------------------------------------------------------------
# 1. HOUR
# ------------------------------------------------------------

hour = int(
    input("\nEnter Hour (0-23): ")
)


# ------------------------------------------------------------
# 2. TEMPERATURE
# ------------------------------------------------------------

temperature = float(
    input("Enter Temperature (°C): ")
)


# ------------------------------------------------------------
# 3. AREA
# ------------------------------------------------------------

print("\nArea Options:")
print("U = Urban")
print("R = Rural")
print("S = Suburban")

area_input = input(
    "Enter Area (U/R/S): "
).strip().upper()


# Convert short form to original dataset value

area_mapping = {
    "U": "Urban",
    "R": "Rural",
    "S": "Suburban"
}


if area_input not in area_mapping:

    print("\nInvalid Area!")

    print("Please use U, R, or S.")

    exit()


area = area_mapping[area_input]


# ------------------------------------------------------------
# 4. DAY TYPE
# ------------------------------------------------------------

print("\nDay Type Options:")
print("W = Weekday")
print("E = Weekend")

day_type_input = input(
    "Enter Day Type (W/E): "
).strip().upper()


# Convert short form

day_type_mapping = {
    "W": "Weekday",
    "E": "Weekend"
}


if day_type_input not in day_type_mapping:

    print("\nInvalid Day Type!")

    print("Please use W or E.")

    exit()


day_type = day_type_mapping[
    day_type_input
]


# ------------------------------------------------------------
# 5. EV ARRIVALS
# ------------------------------------------------------------

ev_arrivals = int(
    input(
        "\nEnter EV Arrivals (e.g. 0-200): "
    )
)


# ------------------------------------------------------------
# 6. OCCUPANCY RATE
# ------------------------------------------------------------

occupancy_rate = float(
    input(
        "Enter Occupancy Rate (0-100): "
    )
)


# ------------------------------------------------------------
# 7. NEARBY EVENT
# ------------------------------------------------------------

print("\nNearby Event:")
print("Y = Yes")
print("N = No")

nearby_event_input = input(
    "Nearby Event (Y/N): "
).strip().upper()


# Convert short form

nearby_event_mapping = {
    "Y": "Yes",
    "N": "No"
}


if nearby_event_input not in nearby_event_mapping:

    print("\nInvalid Event Option!")

    print("Please use Y or N.")

    exit()


nearby_event = nearby_event_mapping[
    nearby_event_input
]


# ------------------------------------------------------------
# 8. RAINFALL
# ------------------------------------------------------------

print("\nRainfall Input:")
print("Enter 0 if there is no rainfall.")
print("Otherwise enter rainfall amount.")

rainfall = float(
    input(
        "Enter Rainfall (mm): "
    )
)


# ============================================================
# FEATURE ENGINEERING INPUT
# ============================================================


# ------------------------------------------------------------
# 9. DAY OF WEEK
# ------------------------------------------------------------

print("\nDay of Week:")
print("0 = Monday")
print("1 = Tuesday")
print("2 = Wednesday")
print("3 = Thursday")
print("4 = Friday")
print("5 = Saturday")
print("6 = Sunday")

day_of_week = int(
    input(
        "Enter Day of Week (0-6): "
    )
)


# ------------------------------------------------------------
# 10. MONTH
# ------------------------------------------------------------

month = int(
    input(
        "Enter Month (1-12): "
    )
)


# ============================================================
# VALIDATION
# ============================================================


# Validate Hour

if hour < 0 or hour > 23:

    print("\nInvalid Hour!")

    print("Hour must be between 0 and 23.")

    exit()


# Validate EV Arrivals

if ev_arrivals < 0:

    print("\nInvalid EV Arrivals!")

    print("EV Arrivals cannot be negative.")

    exit()


# Validate Occupancy Rate

if occupancy_rate < 0 or occupancy_rate > 100:

    print("\nInvalid Occupancy Rate!")

    print("Occupancy Rate must be between 0 and 100.")

    exit()


# Validate Rainfall

if rainfall < 0:

    print("\nInvalid Rainfall!")

    print("Rainfall cannot be negative.")

    exit()


# Validate Day of Week

if day_of_week < 0 or day_of_week > 6:

    print("\nInvalid Day of Week!")

    print("Use a value from 0 to 6.")

    exit()


# Validate Month

if month < 1 or month > 12:

    print("\nInvalid Month!")

    print("Month must be between 1 and 12.")

    exit()


# ============================================================
# CALCULATE WEEKEND
# ============================================================

if day_of_week >= 5:

    is_weekend = 1

else:

    is_weekend = 0


# ============================================================
# CALCULATE TIME PERIOD
# ============================================================

if 5 <= hour < 12:

    time_period = "Morning"

elif 12 <= hour < 17:

    time_period = "Afternoon"

elif 17 <= hour < 21:

    time_period = "Evening"

else:

    time_period = "Night"


# ============================================================
# CALCULATE ARRIVAL PER OCCUPANCY
# ============================================================

arrival_per_occupancy = (
    ev_arrivals /
    (occupancy_rate + 1)
)


# ============================================================
# CREATE INPUT DATA
# ============================================================

new_data = pd.DataFrame({

    "Hour": [hour],

    "Temperature": [temperature],

    "Area": [area],

    "Day_Type": [day_type],

    "EV_Arrivals": [ev_arrivals],

    "Occupancy_Rate": [occupancy_rate],

    "Nearby_Event": [nearby_event],

    "Rainfall": [rainfall],

    "Day_of_Week": [day_of_week],

    "Month": [month],

    "Is_Weekend": [is_weekend],

    "Time_Period": [time_period],

    "Arrival_per_Occupancy": [
        arrival_per_occupancy
    ]

})


# ============================================================
# DISPLAY PROCESSED INPUT
# ============================================================

print("\n==============================================")
print("             PROCESSED INPUT")
print("==============================================")

print(new_data)


# ============================================================
# MAKE PREDICTION
# ============================================================

prediction = model.predict(
    new_data
)


# ============================================================
# PREDICTION PROBABILITY
# ============================================================

prediction_probability = model.predict_proba(
    new_data
)


# ============================================================
# PREDICTION MAPPING
# ============================================================

prediction_mapping = {

    0: "Low",

    1: "Medium",

    2: "High"

}


predicted_demand = prediction_mapping[
    int(prediction[0])
]


# ============================================================
# DISPLAY RAW MODEL PREDICTION
# ============================================================

print("\n==============================================")
print("             MODEL PREDICTION")
print("==============================================")


print(
    "\nRaw Model Prediction:",
    prediction
)


# ============================================================
# DISPLAY PROBABILITIES
# ============================================================

print("\nPrediction Probability:")

print(
    "Low    :",
    round(
        prediction_probability[0][0] * 100,
        2
    ),
    "%"
)

print(
    "Medium :",
    round(
        prediction_probability[0][1] * 100,
        2
    ),
    "%"
)

print(
    "High   :",
    round(
        prediction_probability[0][2] * 100,
        2
    ),
    "%"
)


# ============================================================
# FINAL RESULT
# ============================================================

print("\n==============================================")
print("           PREDICTION RESULT")
print("==============================================")


print(
    "\nPredicted Charging Demand:",
    predicted_demand
)


print("\n==============================================")

print(
    "       Prediction completed successfully!"
)

print("==============================================")