"""
API Route: /api/forecast — Waste volume forecasting
"""
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional

from app.core.security import get_current_user_token, require_role, TokenData
from app.core.weather import get_delhi_weather
from app.data.sample_nodes import SAMPLE_NODES
from app.ml.forecaster import batch_forecast
from app.models.schemas import ForecastRequest, ForecastResponse, NodeForecast

router = APIRouter()


@router.post("/", response_model=ForecastResponse, summary="Generate waste volume forecasts")
async def generate_forecast(
    body: ForecastRequest,
    _token: TokenData = Depends(require_role("manager", "admin")),
):
    """
    Forecast waste volume for a **single node** on a given date.
    Provide weather_code (WMO standard), is_festival, and is_weekend flags
    to get context-aware predictions.
    """
    node = next((n for n in SAMPLE_NODES if n["node_id"] == body.node_id), None)
    if node is None:
        raise HTTPException(status_code=404, detail=f"Node '{body.node_id}' not found")

    try:
        d = date.fromisoformat(body.forecast_date)
    except ValueError:
        raise HTTPException(status_code=422, detail="forecast_date must be ISO 8601 (YYYY-MM-DD)")

    results = batch_forecast(
        [node], d,
        weather_code=body.weather_code or 0,
        is_festival=body.is_festival,
    )
    total_vol = sum(r["predicted_volume_kg"] for r in results)
    high_risk = sum(1 for r in results if r["risk_level"] in ("high", "critical"))

    return ForecastResponse(
        forecast_date=body.forecast_date,
        generated_at=datetime.utcnow(),
        forecasts=[NodeForecast(**r) for r in results],
        high_risk_count=high_risk,
        total_predicted_volume_kg=total_vol,
    )


@router.get("/daily", response_model=ForecastResponse, summary="Forecast all nodes for a date")
async def daily_forecast(
    forecast_date: str = Query(..., description="ISO date: YYYY-MM-DD"),
    zone: Optional[str] = Query(None),
    weather_code: int = Query(0, description="WMO code — 0=clear, 61=rain, 95=storm"),
    is_festival: bool = Query(False),
    _token: TokenData = Depends(require_role("manager", "admin")),
):
    """
    Generate waste forecasts for **all nodes** (optionally filtered by zone)
    for a given date. This is the primary API call used by the dashboard.
    """
    try:
        d = date.fromisoformat(forecast_date)
    except ValueError:
        raise HTTPException(status_code=422, detail="forecast_date must be ISO 8601 (YYYY-MM-DD)")

    nodes = SAMPLE_NODES
    if zone:
        nodes = [n for n in nodes if zone.lower() in n["zone"].lower()]

    if not nodes:
        raise HTTPException(status_code=404, detail=f"No nodes found for zone '{zone}'")

    # Auto-fetch weather from Open-Meteo if no explicit code provided
    if weather_code == 0:
        try:
            wx = await get_delhi_weather(forecast_date)
            weather_code = wx.get("weather_code", 0)
        except Exception:
            pass  # silently keep 0 (clear sky) on failure

    results = batch_forecast(nodes, d, weather_code=weather_code, is_festival=is_festival)
    total_vol = round(sum(r["predicted_volume_kg"] for r in results), 1)
    high_risk = sum(1 for r in results if r["risk_level"] in ("high", "critical"))

    return ForecastResponse(
        forecast_date=forecast_date,
        generated_at=datetime.utcnow(),
        forecasts=[NodeForecast(**r) for r in results],
        high_risk_count=high_risk,
        total_predicted_volume_kg=total_vol,
    )


@router.get("/weather", summary="Current Delhi weather from Open-Meteo")
async def get_weather(
    date: str = Query(default=None, description="ISO date YYYY-MM-DD; defaults to today"),
    _token: TokenData = Depends(get_current_user_token),
):
    """
    Returns real-time Delhi weather for a given date using the free Open-Meteo API.
    No API key required.
    """
    from datetime import date as date_type
    target = date or date_type.today().isoformat()
    try:
        date_type.fromisoformat(target)
    except ValueError:
        raise HTTPException(status_code=422, detail="date must be ISO 8601 (YYYY-MM-DD)")
    return await get_delhi_weather(target)
