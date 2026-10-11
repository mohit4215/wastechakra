r"""
EcoFleet AI — Waste Volume Forecasting Engine
==============================================
Predictive machine learning service engineered for municipal solid waste management
under the Municipal Solid Wastes (Management and Handling) Rules & Delhi Clean Air Action Plan.

Mathematical & Architectural Principles:
----------------------------------------
1. Objective Formulation:
   Trained using XGBoost (Extreme Gradient Boosting) regression minimizing the regularized
   squared loss with L2 regularization (Ridge) and L1 regularization (Lasso):
   
   $$\mathcal{L}(\theta) = \sum_{i=1}^{n} (y_i - \hat{y}_i)^2 + \sum_{k=1}^{K} \left( \gamma T_k + \frac{1}{2}\lambda \|w_k\|^2 + \alpha \|w_k\|_1 \right)$$

2. Feature Schema ($X \in \mathbb{R}^{9}$):
   - $x_0$: Day of Week (0 = Monday, ..., 6 = Sunday)
   - $x_1$: Month of Year (1 - 12)
   - $x_2$: Weekend Indicator ($\mathbb{I}[\text{dow} \ge 5]$)
   - $x_3$: Monday Surge Indicator ($\mathbb{I}[\text{dow} = 0]$)
   - $x_4$: Festival Flag ($\mathbb{I}[\text{Diwali, Eid, Chhath, Dussehra, etc.}]$)
   - $x_5$: Precipitation Flag ($\mathbb{I}[\text{WMO code} \in \{61, 63, 65, 80, 81, 95\}]$)
   - $x_6$: Extreme Weather Event ($\mathbb{I}[\text{WMO code} \in \{95, 96, 99\}]$)
   - $x_7$: Population Density Normalized ($\min(\rho / 50000, 1.0)$)
   - $x_8$: Bin Capacity Normalized ($C / 1000.0\text{ tons}$)

3. Deterministic Heuristic Fallback:
   When joblib model artifact is absent or during fast cold-start in-memory runs,
   computes a deterministic domain-expert heuristic with reproducible pseudo-random noise
   seeded on hash(node_id, date) to ensure 100% deterministic test reproducibility.
"""
from __future__ import annotations

import logging
import math
import os
import zlib
from datetime import datetime, date
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Heuristic weights used by the fallback model
_DAY_WEIGHTS = {0: 1.10, 1: 1.05, 2: 1.00, 3: 0.95, 4: 1.05, 5: 1.30, 6: 1.25}
_WEATHER_WEIGHTS = {0: 1.0, 61: 1.15, 95: 1.20, 3: 0.95}  # clear / rain / storm / overcast

MODEL_PATH = Path(os.getenv("FORECAST_MODEL_PATH", "app/ml/models/waste_forecast_model.joblib"))


def _try_load_model():
    """Attempt to load a pre-trained joblib model. Return None on failure."""
    try:
        import joblib  # noqa: PLC0415
        if MODEL_PATH.exists():
            model = joblib.load(MODEL_PATH)
            logger.info("Loaded trained forecast model from %s", MODEL_PATH)
            return model
    except Exception as exc:  # noqa: BLE001
        logger.warning("Could not load model (%s) — using heuristic fallback", exc)
    return None


_MODEL = _try_load_model()


# ---------------------------------------------------------------------------
# Feature engineering helpers
# ---------------------------------------------------------------------------

def _build_features(
    node: dict,
    target_date: date,
    weather_code: int = 0,
    is_festival: bool = False,
) -> np.ndarray:
    """Build a feature vector for a single (node, date) pair."""
    d = target_date
    dow = d.weekday()            # 0=Monday … 6=Sunday
    month = d.month
    is_weekend = int(dow >= 5)
    is_monday = int(dow == 0)

    # Normalised population density bucket (0-1)
    pop_density = node.get("population_density", 5000)
    pop_norm = min(pop_density / 50_000.0, 1.0)

    # Weather rain flag
    is_rain = int(weather_code in (61, 63, 65, 80, 81, 95))
    is_extreme = int(weather_code in (95, 96, 99))

    features = np.array([
        dow,
        month,
        is_weekend,
        is_monday,
        is_festival,
        is_rain,
        is_extreme,
        pop_norm,
        node.get("capacity_kg", 500) / 1000.0,
    ], dtype=np.float32)

    return features.reshape(1, -1)


# ---------------------------------------------------------------------------
# Heuristic fallback forecast
# ---------------------------------------------------------------------------

def _heuristic_forecast(
    node: dict,
    target_date: date,
    weather_code: int = 0,
    is_festival: bool = False,
) -> tuple[float, float, dict]:
    """
    Return (predicted_volume_kg, confidence, factors).
    Deterministic heuristic based on domain knowledge.
    """
    capacity = node.get("capacity_kg", 500)
    pop_density = node.get("population_density", 5000)

    # Base fill rate proportional to population density (40-75% on average day)
    base_fill = 0.40 + (min(pop_density, 40_000) / 40_000) * 0.35

    dow = target_date.weekday()
    day_multiplier = _DAY_WEIGHTS.get(dow, 1.0)
    weather_multiplier = _WEATHER_WEIGHTS.get(weather_code, 1.0)
    festival_multiplier = 1.40 if is_festival else 1.0

    # Small deterministic noise based on a stable hash of the node id and
    # date. Python's built-in hash() is randomized per process (PYTHONHASHSEED),
    # so it must not be used for values that are documented as reproducible
    # across restarts — zlib.crc32 is stable everywhere.
    seed = zlib.crc32(f"{node.get('node_id', 'x')}|{target_date}".encode()) % 1000
    noise = 1.0 + (seed - 500) / 5000.0   # ±10% noise

    fill_pct = base_fill * day_multiplier * weather_multiplier * festival_multiplier * noise
    fill_pct = min(max(fill_pct, 0.05), 1.0)

    predicted_volume = round(capacity * fill_pct, 1)
    # Deterministic confidence derived from the same seed (no random — reproducible)
    confidence = round(0.75 + (seed / 1000) * 0.15, 3)

    factors = {
        "day_of_week_effect": round(day_multiplier - 1.0, 3),
        "weather_effect": round(weather_multiplier - 1.0, 3),
        "festival_effect": round(festival_multiplier - 1.0, 3),
        "population_density_score": round((pop_density / 40_000) * 100, 1),
    }

    return predicted_volume, confidence, factors


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def predict_waste_volume(
    node: dict,
    target_date: date,
    weather_code: int = 0,
    is_festival: bool = False,
) -> tuple[float, float, dict]:
    """
    Predict waste volume for a given node and date.

    Returns:
        (predicted_volume_kg, confidence, feature_factors)
    """
    if _MODEL is not None:
        try:
            features = _build_features(node, target_date, weather_code, is_festival)
            pred = float(_MODEL.predict(features)[0])
            # Clamp prediction to physical limits
            pred = max(0, min(pred, node.get("capacity_kg", 500) * 1.1))
            factors = {}
            # XGBoost feature importance if available
            if hasattr(_MODEL, "feature_importances_"):
                names = ["dow", "month", "is_weekend", "is_monday", "is_festival",
                         "is_rain", "is_extreme", "pop_norm", "capacity_norm"]
                factors = {n: round(float(v), 4)
                           for n, v in zip(names, _MODEL.feature_importances_)}
            return round(pred, 1), 0.92, factors
        except Exception as exc:  # noqa: BLE001
            logger.warning("Model prediction failed: %s — falling back to heuristic", exc)

    return _heuristic_forecast(node, target_date, weather_code, is_festival)


def classify_risk(fill_percentage: float) -> str:
    """Map fill percentage to risk level."""
    if fill_percentage >= 90:
        return "critical"
    if fill_percentage >= 70:
        return "high"
    if fill_percentage >= 45:
        return "medium"
    return "low"


def batch_forecast(
    nodes: List[dict],
    target_date: date,
    weather_code: int = 0,
    is_festival: bool = False,
) -> List[dict]:
    """
    Run forecast for a list of nodes.
    Returns list of enriched forecast dicts ready for serialisation.
    """
    results = []
    for node in nodes:
        vol, conf, factors = predict_waste_volume(node, target_date, weather_code, is_festival)
        capacity = node.get("capacity_kg", 500)
        fill_pct = round((vol / capacity) * 100, 1) if capacity > 0 else 0.0
        results.append({
            "node_id": node["node_id"],
            "node_name": node.get("name", node["node_id"]),
            "forecast_date": target_date.isoformat(),
            "predicted_volume_kg": vol,
            "capacity_kg": capacity,
            "fill_percentage": fill_pct,
            "risk_level": classify_risk(fill_pct),
            "confidence": conf,
            "factors": factors,
        })
    return results
