# ============================================================
# EV Charging Demand Prediction
# MAIN.PY
# Model Training and Saving
# ============================================================


# ============================================================
# STEP 1: IMPORT REQUIRED LIBRARIES
# ============================================================

import pandas as pd
import numpy as np

import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import (
    train_test_split,
    GridSearchCV
)

from sklearn.preprocessing import (
    OneHotEncoder,
    StandardScaler
)

from sklearn.compose import ColumnTransformer

from sklearn.pipeline import Pipeline

from sklearn.linear_model import LogisticRegression

from sklearn.tree import DecisionTreeClassifier

from sklearn.ensemble import RandomForestClassifier

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

from xgboost import XGBClassifier

import joblib


print("All required libraries imported successfully!")


# ============================================================
# STEP 2: LOAD DATASET
# ============================================================

df = pd.read_csv(
    "data/ev_charging_demand.csv"
)

print("\nDataset loaded successfully!")


# ============================================================
# STEP 3: UNDERSTAND DATASET
# ============================================================

print("\nFirst 5 Rows:")
print(df.head())


print("\nLast 5 Rows:")
print(df.tail())


print("\nDataset Shape:")
print(df.shape)


print("\nColumn Names:")
print(df.columns.tolist())


print("\nData Types:")
print(df.dtypes)


print("\nDataset Information:")
df.info()


print("\nMissing Values:")
print(df.isnull().sum())


print("\nNumber of Duplicate Rows:")
print(df.duplicated().sum())


print("\nCharging Demand Distribution:")
print(
    df["Charging_Demand"].value_counts()
)


# ============================================================
# STEP 4: DATA CLEANING
# ============================================================

# Remove duplicate records

df = df.drop_duplicates()


# Convert Date column to datetime

df["Date"] = pd.to_datetime(
    df["Date"],
    errors="coerce"
)


# Numerical columns

numeric_columns = [
    "Hour",
    "Temperature",
    "EV_Arrivals",
    "Occupancy_Rate",
    "Rainfall"
]


# Convert numerical columns

for column in numeric_columns:

    df[column] = pd.to_numeric(
        df[column],
        errors="coerce"
    )


# Remove rows where target is missing

df = df.dropna(
    subset=["Charging_Demand"]
)


# Fill missing numerical values

for column in numeric_columns:

    df[column] = df[column].fillna(
        df[column].median()
    )


# Categorical columns

categorical_columns = [
    "Area",
    "Day_Type",
    "Nearby_Event"
]


# Fill missing categorical values

for column in categorical_columns:

    df[column] = df[column].fillna(
        df[column].mode()[0]
    )


# Keep valid hour values

df = df[
    (df["Hour"] >= 0)
    &
    (df["Hour"] <= 23)
]


# Keep valid occupancy values

df = df[
    (df["Occupancy_Rate"] >= 0)
    &
    (df["Occupancy_Rate"] <= 100)
]


# Remove rows where Date is invalid

df = df.dropna(
    subset=["Date"]
)


# Reset index

df = df.reset_index(
    drop=True
)


print(
    "\nData cleaning completed successfully!"
)


print("\nCleaned Dataset Shape:")
print(df.shape)


# ============================================================
# STEP 5: EXPLORATORY DATA ANALYSIS
# ============================================================

# ------------------------------------------------------------
# 1. Target Distribution
# ------------------------------------------------------------

plt.figure(
    figsize=(7, 5)
)

sns.countplot(
    data=df,
    x="Charging_Demand"
)

plt.title(
    "Charging Demand Distribution"
)

plt.xlabel(
    "Charging Demand"
)

plt.ylabel(
    "Number of Records"
)

plt.show()


# ------------------------------------------------------------
# 2. Charging Demand by Hour
# ------------------------------------------------------------

hour_demand = (
    df.groupby("Hour")[
        "Charging_Demand"
    ]
    .count()
)


plt.figure(
    figsize=(10, 5)
)

plt.plot(
    hour_demand.index,
    hour_demand.values,
    marker="o"
)

plt.title(
    "Charging Records by Hour"
)

plt.xlabel(
    "Hour"
)

plt.ylabel(
    "Number of Records"
)

plt.xticks(
    range(24)
)

plt.show()


# ------------------------------------------------------------
# 3. EV Arrivals vs Occupancy Rate
# ------------------------------------------------------------

plt.figure(
    figsize=(8, 5)
)

plt.scatter(
    df["EV_Arrivals"],
    df["Occupancy_Rate"],
    alpha=0.5
)

plt.title(
    "EV Arrivals vs Occupancy Rate"
)

plt.xlabel(
    "EV Arrivals"
)

plt.ylabel(
    "Occupancy Rate"
)

plt.show()


# ------------------------------------------------------------
# 4. Average EV Arrivals by Charging Demand
# ------------------------------------------------------------

avg_arrivals = (
    df.groupby(
        "Charging_Demand",
        observed=True
    )["EV_Arrivals"]
    .mean()
)


plt.figure(
    figsize=(7, 5)
)

avg_arrivals.plot(
    kind="bar"
)

plt.title(
    "Average EV Arrivals by Charging Demand"
)

plt.xlabel(
    "Charging Demand"
)

plt.ylabel(
    "Average EV Arrivals"
)

plt.xticks(
    rotation=0
)

plt.show()


# ------------------------------------------------------------
# 5. Average Occupancy by Charging Demand
# ------------------------------------------------------------

avg_occupancy = (
    df.groupby(
        "Charging_Demand",
        observed=True
    )["Occupancy_Rate"]
    .mean()
)


plt.figure(
    figsize=(7, 5)
)

avg_occupancy.plot(
    kind="bar"
)

plt.title(
    "Average Occupancy Rate by Charging Demand"
)

plt.xlabel(
    "Charging Demand"
)

plt.ylabel(
    "Average Occupancy Rate"
)

plt.xticks(
    rotation=0
)

plt.show()


# ------------------------------------------------------------
# 6. Correlation Analysis
# ------------------------------------------------------------

numeric_columns_for_correlation = [
    "Hour",
    "Temperature",
    "EV_Arrivals",
    "Occupancy_Rate",
    "Rainfall"
]


correlation_matrix = df[
    numeric_columns_for_correlation
].corr()


print(
    "\nCorrelation Matrix:"
)

print(
    correlation_matrix
)


# ------------------------------------------------------------
# 7. Correlation Heatmap
# ------------------------------------------------------------

plt.figure(
    figsize=(8, 6)
)

sns.heatmap(
    correlation_matrix,
    annot=True,
    cmap="coolwarm",
    fmt=".2f"
)

plt.title(
    "Feature Correlation Heatmap"
)

plt.show()


print(
    "\nEDA completed successfully!"
)


# ============================================================
# STEP 6: FEATURE ENGINEERING
# ============================================================

# Day of week

df["Day_of_Week"] = (
    df["Date"].dt.dayofweek
)


# Month

df["Month"] = (
    df["Date"].dt.month
)


# Weekend indicator

df["Is_Weekend"] = (
    df["Day_of_Week"] >= 5
).astype(int)


# ------------------------------------------------------------
# Time Period Function
# ------------------------------------------------------------

def get_time_period(hour):

    if 5 <= hour < 12:

        return "Morning"

    elif 12 <= hour < 17:

        return "Afternoon"

    elif 17 <= hour < 21:

        return "Evening"

    else:

        return "Night"


df["Time_Period"] = (
    df["Hour"].apply(
        get_time_period
    )
)


# ------------------------------------------------------------
# Arrival per Occupancy
# ------------------------------------------------------------

df["Arrival_per_Occupancy"] = (
    df["EV_Arrivals"]
    /
    (df["Occupancy_Rate"] + 1)
)


print(
    "\nNew Features Created:"
)

print([
    "Day_of_Week",
    "Month",
    "Is_Weekend",
    "Time_Period",
    "Arrival_per_Occupancy"
])


print(
    "\nFeature Engineering completed successfully!"
)


# ============================================================
# STEP 7: PREPARE FEATURES AND TARGET
# ============================================================

target_column = (
    "Charging_Demand"
)


feature_columns = [

    "Hour",

    "Temperature",

    "Area",

    "Day_Type",

    "EV_Arrivals",

    "Occupancy_Rate",

    "Nearby_Event",

    "Rainfall",

    "Day_of_Week",

    "Month",

    "Is_Weekend",

    "Time_Period",

    "Arrival_per_Occupancy"
]


# Create X

X = df[
    feature_columns
]


# Create y

y = df[
    target_column
]


print(
    "\nFeatures Shape:"
)

print(
    X.shape
)


print(
    "\nTarget Shape:"
)

print(
    y.shape
)


print(
    "\nFeatures and Target prepared successfully!"
)


# ============================================================
# STEP 8: TRAIN-TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = (
    train_test_split(

        X,

        y,

        test_size=0.20,

        random_state=42,

        stratify=y
    )
)


print(
    "\nTrain-Test Split Completed!"
)


print(
    "Training Features:",
    X_train.shape
)


print(
    "Testing Features:",
    X_test.shape
)


print(
    "Training Target:",
    y_train.shape
)


print(
    "Testing Target:",
    y_test.shape
)


# ============================================================
# STEP 9: PREPROCESSING
# ============================================================

categorical_features = [

    "Area",

    "Day_Type",

    "Nearby_Event",

    "Time_Period"
]


numerical_features = [

    "Hour",

    "Temperature",

    "EV_Arrivals",

    "Occupancy_Rate",

    "Rainfall",

    "Day_of_Week",

    "Month",

    "Is_Weekend",

    "Arrival_per_Occupancy"
]


scaled_preprocessor = (
    ColumnTransformer(

        transformers=[

            (
                "categorical",

                OneHotEncoder(
                    handle_unknown="ignore"
                ),

                categorical_features
            ),

            (
                "numerical",

                StandardScaler(),

                numerical_features
            )
        ]
    )
)


print(
    "\nPreprocessing Pipeline Created Successfully!"
)


# ============================================================
# STEP 10: TARGET ENCODING
# ============================================================

target_mapping = {

    "Low": 0,

    "Medium": 1,

    "High": 2
}


y_train_encoded = (
    y_train.map(
        target_mapping
    )
)


y_test_encoded = (
    y_test.map(
        target_mapping
    )
)


print(
    "\nTarget Encoding Completed!"
)


# ============================================================
# STEP 11: MODEL TRAINING
# ============================================================

models = {

    "Logistic Regression":
        LogisticRegression(
            max_iter=2000
        ),

    "Decision Tree":
        DecisionTreeClassifier(
            random_state=42
        ),

    "Random Forest":
        RandomForestClassifier(
            n_estimators=100,

            random_state=42
        ),

    "XGBoost":
        XGBClassifier(

            n_estimators=100,

            max_depth=5,

            learning_rate=0.1,

            random_state=42,

            eval_metric="mlogloss"
        )
}


trained_models = {}


print(
    "\nStarting Model Training..."
)


for name, model in models.items():

    pipeline = Pipeline(

        steps=[

            (
                "preprocessor",

                scaled_preprocessor
            ),

            (
                "model",

                model
            )
        ]
    )


    pipeline.fit(

        X_train,

        y_train_encoded
    )


    trained_models[name] = (
        pipeline
    )


    print(
        f"{name} trained successfully!"
    )


print(
    "\nAll models trained successfully!"
)


# ============================================================
# STEP 12: MODEL EVALUATION
# ============================================================

results = []


for name, pipeline in (
    trained_models.items()
):

    y_pred = (
        pipeline.predict(
            X_test
        )
    )


    accuracy = accuracy_score(

        y_test_encoded,

        y_pred
    )


    precision = precision_score(

        y_test_encoded,

        y_pred,

        average="weighted",

        zero_division=0
    )


    recall = recall_score(

        y_test_encoded,

        y_pred,

        average="weighted",

        zero_division=0
    )


    f1 = f1_score(

        y_test_encoded,

        y_pred,

        average="weighted",

        zero_division=0
    )


    results.append({

        "Model": name,

        "Accuracy": accuracy,

        "Precision": precision,

        "Recall": recall,

        "F1_Score": f1
    })


# Create results DataFrame

results_df = pd.DataFrame(
    results
)


# Sort by F1 Score

results_df = (
    results_df
    .sort_values(
        by="F1_Score",
        ascending=False
    )
    .reset_index(
        drop=True
    )
)


print(
    "\n=============================================="
)

print(
    "MODEL PERFORMANCE COMPARISON"
)

print(
    "=============================================="
)

print(
    results_df
)


best_model_name = (
    results_df.loc[
        0,
        "Model"
    ]
)


print(
    "\nBest Performing Model:"
)

print(
    best_model_name
)


# ============================================================
# STEP 13: HYPERPARAMETER TUNING
# ============================================================

logistic_pipeline = Pipeline(

    steps=[

        (
            "preprocessor",

            scaled_preprocessor
        ),

        (
            "model",

            LogisticRegression(
                max_iter=3000
            )
        )
    ]
)


param_grid = {

    "model__C":
        [
            0.01,
            0.1,
            1,
            10,
            100
        ],

    "model__solver":
        [
            "lbfgs"
        ]
}


grid_search = GridSearchCV(

    estimator=logistic_pipeline,

    param_grid=param_grid,

    cv=5,

    scoring="accuracy",

    n_jobs=-1
)


print(
    "\nStarting Hyperparameter Tuning..."
)


grid_search.fit(

    X_train,

    y_train_encoded
)


print(
    "\nBest Parameters:"
)

print(
    grid_search.best_params_
)


print(
    "\nBest Cross-Validation Accuracy:"
)

print(
    grid_search.best_score_
)


improved_model = (
    grid_search.best_estimator_
)


# ============================================================
# STEP 14: IMPROVED MODEL EVALUATION
# ============================================================

y_pred_improved = (
    improved_model.predict(
        X_test
    )
)


improved_accuracy = (
    accuracy_score(

        y_test_encoded,

        y_pred_improved
    )
)


improved_precision = (
    precision_score(

        y_test_encoded,

        y_pred_improved,

        average="weighted",

        zero_division=0
    )
)


improved_recall = (
    recall_score(

        y_test_encoded,

        y_pred_improved,

        average="weighted",

        zero_division=0
    )
)


improved_f1 = (
    f1_score(

        y_test_encoded,

        y_pred_improved,

        average="weighted",

        zero_division=0
    )
)


print(
    "\n=============================================="
)

print(
    "IMPROVED LOGISTIC REGRESSION RESULTS"
)

print(
    "=============================================="
)


print(
    "Accuracy:",
    improved_accuracy
)


print(
    "Precision:",
    improved_precision
)


print(
    "Recall:",
    improved_recall
)


print(
    "F1 Score:",
    improved_f1
)


# ============================================================
# STEP 15: SELECT FINAL MODEL
# ============================================================

baseline_accuracy = (
    results_df.loc[

        results_df["Model"]
        == "Logistic Regression",

        "Accuracy"

    ].iloc[0]
)


print(
    "\nBaseline Accuracy:"
)

print(
    baseline_accuracy
)


print(
    "\nImproved Accuracy:"
)

print(
    improved_accuracy
)


if improved_accuracy >= baseline_accuracy:

    final_model = (
        improved_model
    )

    print(
        "\nFinal Model Selected:"
        " Improved Logistic Regression"
    )

else:

    final_model = (
        trained_models[
            "Logistic Regression"
        ]
    )

    print(
        "\nFinal Model Selected:"
        " Baseline Logistic Regression"
    )


# ============================================================
# STEP 16: FINAL MODEL EVALUATION
# ============================================================

final_predictions = (
    final_model.predict(
        X_test
    )
)


# ------------------------------------------------------------
# Confusion Matrix
# ------------------------------------------------------------

cm = confusion_matrix(

    y_test_encoded,

    final_predictions
)


print(
    "\n=============================================="
)

print(
    "CONFUSION MATRIX"
)

print(
    "=============================================="
)

print(
    cm
)


# ------------------------------------------------------------
# Classification Report
# ------------------------------------------------------------

print(
    "\n=============================================="
)

print(
    "CLASSIFICATION REPORT"
)

print(
    "=============================================="
)


print(
    classification_report(

        y_test_encoded,

        final_predictions,

        target_names=[

            "Low",

            "Medium",

            "High"
        ],

        zero_division=0
    )
)


# ------------------------------------------------------------
# Final Accuracy
# ------------------------------------------------------------

final_accuracy = (
    accuracy_score(

        y_test_encoded,

        final_predictions
    )
)


print(
    "\nFinal Model Accuracy:"
)

print(
    final_accuracy
)


# ============================================================
# STEP 17: SAVE FINAL MODEL
# ============================================================

model_filename = (
    "final_ev_charging_demand_model.pkl"
)


joblib.dump(

    final_model,

    model_filename
)


print(
    "\n=============================================="
)

print(
    "MODEL SAVED SUCCESSFULLY!"
)

print(
    "=============================================="
)

print(
    "Model file:",
    model_filename
)


# ============================================================
# TRAINING COMPLETED
# ============================================================

print(
    "\n=============================================="
)

print(
    "EV CHARGING DEMAND MODEL TRAINING COMPLETED!"
)

print(
    "=============================================="
)

print(
    "Final Accuracy:",
    final_accuracy
)

print(
    "Saved Model:",
    model_filename
)

print(
    "\nUse predict.py to make new predictions."
)

print(
    "=============================================="
)