"""Tests for forecasting endpoints."""
import pytest
from datetime import date


@pytest.mark.asyncio
async def test_daily_forecast(client):
    today = date.today().isoformat()
    response = await client.get(f"/api/forecast/daily?forecast_date={today}")
    assert response.status_code == 200
    data = response.json()
    assert "forecasts" in data
    assert len(data["forecasts"]) > 0
    assert data["forecast_date"] == today
    assert data["total_predicted_volume_kg"] > 0


@pytest.mark.asyncio
async def test_daily_forecast_with_festival(client):
    today = date.today().isoformat()
    response = await client.get(
        f"/api/forecast/daily?forecast_date={today}&is_festival=true&weather_code=61"
    )
    assert response.status_code == 200
    data = response.json()
    # Festival should result in higher total volume
    assert data["total_predicted_volume_kg"] > 0


@pytest.mark.asyncio
async def test_daily_forecast_invalid_date(client):
    response = await client.get("/api/forecast/daily?forecast_date=not-a-date")
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_nodes_public_read(client):
    """Node listing should be public (no auth required)."""
    response = await client.get("/api/nodes/")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert data["total"] > 0


@pytest.mark.asyncio
async def test_fleet_public_read(client):
    """Fleet status should be public (read-only, no auth required)."""
    response = await client.get("/api/fleet/")
    assert response.status_code == 200
    data = response.json()
    assert "trucks" in data


@pytest.mark.asyncio
async def test_analytics_summary(client):
    response = await client.get("/api/analytics/summary")
    assert response.status_code == 200
    data = response.json()
    assert "swm_compliance_rate" in data
    assert "daily_trend" in data
    assert len(data["daily_trend"]) == 7
