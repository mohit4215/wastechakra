"""Tests for route optimization endpoints."""
import pytest
from datetime import date


@pytest.mark.asyncio
async def test_optimize_routes(client, auth_headers):
    today = date.today().isoformat()
    response = await client.post("/api/routing/optimize", json={
        "forecast_date": today,
        "num_trucks": 3,
        "truck_capacity_kg": 5000,
        "skip_low_risk": True,
    }, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "routes" in data
    assert data["total_routes"] >= 0
    assert "total_distance_km" in data
    assert "co2_saved_kg" in data


@pytest.mark.asyncio
async def test_today_routes(client, auth_headers):
    response = await client.get("/api/routing/today?num_trucks=3", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "routes" in data


@pytest.mark.asyncio
async def test_route_history(client, auth_headers):
    response = await client.get("/api/routing/history", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_optimize_routes_requires_auth(client):
    """Routing endpoints must reject unauthenticated requests."""
    today = date.today().isoformat()
    response = await client.post("/api/routing/optimize", json={
        "forecast_date": today,
        "num_trucks": 1,
        "truck_capacity_kg": 5000,
        "skip_low_risk": True,
    })
    assert response.status_code == 401
