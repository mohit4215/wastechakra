"""Tests for health and root endpoints."""
import pytest


@pytest.mark.asyncio
async def test_health(client):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "ecofleet-backend"


@pytest.mark.asyncio
async def test_root(client):
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "EcoFleet AI"
    assert "features" in data


@pytest.mark.asyncio
async def test_liveness(client):
    response = await client.get("/health/live")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["check"] == "liveness"


@pytest.mark.asyncio
async def test_readiness(client):
    response = await client.get("/health/ready")
    assert response.status_code in (200, 503)
    data = response.json()
    assert data["check"] == "readiness"
    assert "database" in data["dependencies"]


@pytest.mark.asyncio
async def test_request_id_header_echo(client):
    response = await client.get("/health", headers={"X-Request-ID": "test-request-id-123"})
    assert response.status_code == 200
    assert response.headers.get("X-Request-ID") == "test-request-id-123"
