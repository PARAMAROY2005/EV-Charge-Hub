# ============================================================
# EV Charging Demand Prediction
# Step 1: Generate a Realistic Synthetic Dataset
# ============================================================

# Import required libraries
import pandas as pd
import numpy as np


# ------------------------------------------------------------
# 1. Set random seed
# ------------------------------------------------------------
# This makes the randomly generated dataset reproducible.
# Running the same code again will generate the same data.
np.random.seed(42)


# ------------------------------------------------------------
# 2. Define the number of records
# ------------------------------------------------------------
# We are creating 10,000 observations for our ML project.
n_records = 10000


# ------------------------------------------------------------
# 3. Generate date and time information
# ------------------------------------------------------------
# Generate dates for one year.
dates = pd.date_range(
    start="2025-01-01",
    end="2025-12-31",
    freq="D"
)

# Randomly assign a date to each record.
date_values = np.random.choice(
    dates,
    size=n_records
)

# Generate a random hour between 0 and 23.
hour_values = np.random.randint(
    0,
    24,
    size=n_records
)


# ------------------------------------------------------------
# 4. Generate charging station locations
# ------------------------------------------------------------
areas = [
    "Salt Lake",
    "New Town",
    "Rajarhat",
    "Park Street",
    "Sector V"
]

area_values = np.random.choice(
    areas,
    size=n_records
)


# ------------------------------------------------------------
# 5. Generate temperature data
# ------------------------------------------------------------
# Generate realistic temperature variation.
temperature_values = np.random.normal(
    loc=28,
    scale=4,
    size=n_records
)

# Round temperature values to one decimal place.
temperature_values = np.round(
    temperature_values,
    1
)


# ------------------------------------------------------------
# 6. Determine weekday or weekend
# ------------------------------------------------------------
day_type_values = np.where(
    pd.to_datetime(date_values).dayofweek < 5,
    "Weekday",
    "Weekend"
)


# ------------------------------------------------------------
# 7. Generate EV arrival data
# ------------------------------------------------------------
# Poisson distribution is used to simulate the number
# of EVs arriving at charging stations.
ev_arrivals = np.random.poisson(
    lam=80,
    size=n_records
)


# ------------------------------------------------------------
# 8. Generate station occupancy rate
# ------------------------------------------------------------
# Occupancy is influenced by EV arrivals plus some
# natural random variation.
occupancy_rate = (
    ev_arrivals / 1.5
    + np.random.normal(
        0,
        8,
        n_records
    )
)

# Keep occupancy between 5% and 100%.
occupancy_rate = np.clip(
    occupancy_rate,
    5,
    100
)

# Round occupancy values.
occupancy_rate = np.round(
    occupancy_rate,
    1
)


# ------------------------------------------------------------
# 9. Generate nearby event information
# ------------------------------------------------------------
nearby_event = np.random.choice(
    ["Yes", "No"],
    size=n_records,
    p=[0.20, 0.80]
)


# ------------------------------------------------------------
# 10. Generate rainfall data
# ------------------------------------------------------------
rainfall = np.random.exponential(
    scale=3,
    size=n_records
)

rainfall = np.round(
    rainfall,
    1
)


# ------------------------------------------------------------
# 11. Generate a hidden demand score
# ------------------------------------------------------------
# The score combines several factors that can influence
# EV charging demand.

demand_score = (
    ev_arrivals * 0.55
    + occupancy_rate * 0.35
    + (nearby_event == "Yes") * 15
    + (day_type_values == "Weekend") * 5
    - rainfall * 0.5
    + np.random.normal(
        0,
        10,
        n_records
    )
)


# ------------------------------------------------------------
# 12. Convert demand score into demand categories
# ------------------------------------------------------------
# This becomes our TARGET variable.

charging_demand = pd.cut(
    demand_score,
    bins=[
        -np.inf,
        55,
        90,
        np.inf
    ],
    labels=[
        "Low",
        "Medium",
        "High"
    ]
)


# ------------------------------------------------------------
# 13. Create the final dataset
# ------------------------------------------------------------
df = pd.DataFrame({
    "Date": date_values,
    "Hour": hour_values,
    "Area": area_values,
    "Temperature": temperature_values,
    "Day_Type": day_type_values,
    "EV_Arrivals": ev_arrivals,
    "Occupancy_Rate": occupancy_rate,
    "Nearby_Event": nearby_event,
    "Rainfall": rainfall,
    "Charging_Demand": charging_demand
})


# ------------------------------------------------------------
# 14. Sort the dataset
# ------------------------------------------------------------
df = df.sort_values(
    by=["Date", "Hour"]
).reset_index(drop=True)


# ------------------------------------------------------------
# 15. Create the data folder
# ------------------------------------------------------------
import os

os.makedirs(
    "data",
    exist_ok=True
)


# ------------------------------------------------------------
# 16. Save the dataset as a CSV file
# ------------------------------------------------------------
file_path = "data/ev_charging_demand.csv"

df.to_csv(
    file_path,
    index=False
)


# ------------------------------------------------------------
# 17. Display dataset information
# ------------------------------------------------------------
print("=" * 60)
print("EV CHARGING DEMAND DATASET CREATED SUCCESSFULLY")
print("=" * 60)

print("\nDataset Shape:")
print(df.shape)

print("\nFirst 10 Records:")
print(df.head(10))

print("\nTarget Distribution:")
print(df["Charging_Demand"].value_counts())

print("\nDataset saved at:")
print(file_path)