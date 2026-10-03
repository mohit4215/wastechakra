"""Tests for forecasting endpoints."""
import pytest
from datetime import date


@pytest.mark.asyncio
async def test_daily_forecast(client, auth_headers):
    today = date.today().isoformat()
    response = await client.get(f"/api/forecast/daily?forecast_date={today}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "forecasts" in data
    assert len(data["forecasts"]) > 0
    assert data["forecast_date"] == today
    assert data["total_predicted_volume_kg"] > 0


@pytest.mark.asyncio
async def test_daily_forecast_with_festival(client, auth_headers):
    today = date.today().isoformat()
    response = await client.get(
        f"/api/forecast/daily?forecast_date={today}&is_festival=true&weather_code=61",
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    # Festival should result in higher total volume
    assert data["total_predicted_volume_kg"] > 0


@pytest.mark.asyncio
async def test_daily_forecast_invalid_date(client, auth_headers):
    response = await client.get("/api/forecast/daily?forecast_date=not-a-date", headers=auth_headers)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_nodes_require_auth(client):
    """Node listing requires authentication."""
    response = await client.get("/api/nodes/")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_nodes_authenticated_read(client, auth_headers):
    """Node listing works with a valid token."""
    response = await client.get("/api/nodes/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert data["total"] > 0


@pytest.mark.asyncio
async def test_fleet_require_auth(client):
    """Fleet status requires authentication."""
    response = await client.get("/api/fleet/")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_fleet_authenticated_read(client, auth_headers):
    """Fleet status works with a valid token."""
    response = await client.get("/api/fleet/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "trucks" in data


@pytest.mark.asyncio
async def test_analytics_summary(client, auth_headers):
    response = await client.get("/api/analytics/summary", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "swm_compliance_rate" in data
    assert "daily_trend" in data
    assert len(data["daily_trend"]) == 7


@pytest.mark.asyncio
async def test_citizen_report_public(client):
    """Citizen report endpoint must remain public (no auth required)."""
    response = await client.post("/api/nodes/NODE-001/report", json={
        "issue_type": "overflow",
        "description": "Bin overflowing at market",
        "estimated_overflow_kg": 200,
    })
    # Public endpoint — must not return 401
    assert response.status_code != 401
