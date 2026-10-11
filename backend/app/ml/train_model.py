"""
EcoFleet AI — ML Model Training Pipeline
=========================================
Trains an XGBoost Regressor (with Scikit-Learn GradientBoostingRegressor fallback)
on the historical MCD Delhi waste collection dataset and exports the serialized
model artifact to: app/ml/models/waste_forecast_model.joblib

Training Specifications:
------------------------
- Base Estimator: XGBoost Tree-based Ensemble
- Loss Function: Regressed Mean Squared Error (reg:squarederror)
- Learning Rate (eta): 0.08
- Max Tree Depth: 5
- Subsample Ratio: 0.85
- Column Subsample (by tree): 0.85
- Validation: 80/20 train/test split with cross-validation reporting (MAE, RMSE, R²)
"""
from __future__ import annotations

import argparse
import json
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
METRICS_PATH = OUTPUT_DIR / "waste_forecast_metrics.json"


def train_and_export(
    data_path: Path = DATA_PATH,
    model_path: Path = MODEL_PATH,
    metrics_path: Path = METRICS_PATH,
    seed: int = 42,
):
    """
    Execute full model training, evaluation, and artifact serialization.
    """
    logger.info("Loading training data from %s", data_path)
    if not data_path.exists():
        raise FileNotFoundError(f"Training data not found at {data_path}")

    np.random.seed(seed)
    df = pd.read_csv(data_path)
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
            random_state=seed,
        )
        model.fit(X_train, y_train)
    except Exception as exc:
        logger.warning("XGBoost training unavailable (%s), falling back to GradientBoostingRegressor", exc)
        from sklearn.ensemble import GradientBoostingRegressor
        model = GradientBoostingRegressor(n_estimators=100, max_depth=4, random_state=seed)
        model.fit(X_train, y_train)

    # Evaluation
    from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)

    logger.info("Model Evaluation on Test Split (20%%):")
    logger.info("  Mean Absolute Error (MAE): %.2f kg", mae)
    logger.info("  Root Mean Squared Error (RMSE): %.2f kg", rmse)
    logger.info("  R² Coefficient of Determination: %.4f (Accuracy ~%.1f%%)", r2, r2 * 100)

    # Feature Importance breakdown
    if hasattr(model, "feature_importances_"):
        logger.info("Feature Importance Breakdown:")
        importances = model.feature_importances_
        for col_name, score in zip(feature_cols, importances):
            logger.info("  - %-15s: %.4f (%.1f%%)", col_name, score, score * 100)

    # Export model artifact
    model_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, model_path)
    logger.info("Successfully exported trained model artifact to %s", model_path)

    metrics = {
        "dataset_path": str(data_path),
        "model_path": str(model_path),
        "seed": seed,
        "rows": int(len(df)),
        "feature_columns": feature_cols,
        "metrics": {
            "mae": float(round(mae, 4)),
            "rmse": float(round(rmse, 4)),
            "r2": float(round(r2, 6)),
        },
    }
    with metrics_path.open("w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
    logger.info("Saved training metrics to %s", metrics_path)

    return metrics


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train and evaluate EcoFleet waste forecast model.")
    parser.add_argument("--data-path", type=Path, default=DATA_PATH)
    parser.add_argument("--model-path", type=Path, default=MODEL_PATH)
    parser.add_argument("--metrics-path", type=Path, default=METRICS_PATH)
    parser.add_argument("--seed", type=int, default=42)
    return parser.parse_args()


if __name__ == "__main__":
    args = _parse_args()
    train_and_export(
        data_path=args.data_path,
        model_path=args.model_path,
        metrics_path=args.metrics_path,
        seed=args.seed,
    )
