"""
EcoFleet AI — ML Model Training Pipeline
Trains an XGBoost Regressor (with Random Forest fallback) on the 180-day
MCD South Delhi waste collection dataset and exports the model to:
app/ml/models/waste_forecast_model.joblib
"""
import logging
from pathlib import Path
import numpy as np
import pandas as pd
import joblib

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("train_model")

DATA_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "mcd_delhi_waste_history.csv"
OUTPUT_DIR = Path(__file__).resolve().parent / "models"
MODEL_PATH = OUTPUT_DIR / "waste_forecast_model.joblib"


def train_and_export():
    logger.info("Loading training data from %s", DATA_PATH)
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Training data not found at {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)
    logger.info("Loaded %d records across %d collection nodes.", len(df), df["node_id"].nunique())

    # Build feature matrix matching forecaster._build_features
    df["pop_norm"] = df["population_density"].apply(lambda p: min(p / 50000.0, 1.0))
    df["is_rain"] = df["weather_code"].apply(lambda c: int(c in (61, 63, 65, 80, 81, 95)))
    df["is_extreme"] = df["weather_code"].apply(lambda c: int(c in (95, 96, 99)))
    df["capacity_norm"] = df["capacity_kg"] / 1000.0
    df["is_festival"] = df["is_festival"].astype(int)

    feature_cols = [
        "day_of_week",
        "month",
        "is_weekend",
        "is_monday",
        "is_festival",
        "is_rain",
        "is_extreme",
        "pop_norm",
        "capacity_norm",
    ]

    X = df[feature_cols].values.astype(np.float32)
    y = df["actual_waste_kg"].values.astype(np.float32)

    # Train / test split (80/20)
    split_idx = int(len(X) * 0.8)
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]

    model = None
    try:
        from xgboost import XGBRegressor
        logger.info("Training XGBoost Regressor...")
        model = XGBRegressor(
            n_estimators=120,
            max_depth=5,
            learning_rate=0.08,
            subsample=0.85,
            colsample_bytree=0.85,
            random_state=42,
        )
        model.fit(X_train, y_train)
    except Exception as exc:
        logger.warning("XGBoost training unavailable (%s), falling back to GradientBoostingRegressor", exc)
        from sklearn.ensemble import GradientBoostingRegressor
        model = GradientBoostingRegressor(n_estimators=100, max_depth=4, random_state=42)
        model.fit(X_train, y_train)

    # Evaluation
    from sklearn.metrics import mean_absolute_error, r2_score
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    logger.info("Model Evaluation:")
    logger.info("  Mean Absolute Error (MAE): %.2f kg", mae)
    logger.info("  R² Score: %.4f (Accuracy ~%.1f%%)", r2, r2 * 100)

    # Export model artifact
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    logger.info("Successfully exported trained model artifact to %s", MODEL_PATH)


if __name__ == "__main__":
    train_and_export()
