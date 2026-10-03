"""Tests for authentication endpoints."""
import pytest


TEST_EMAIL = "testuser@ecofleet.ai"
TEST_PASSWORD = "TestPass@123"
TEST_NAME = "Test User"


@pytest.mark.asyncio
async def test_register_user(client):
    response = await client.post("/api/auth/register", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD,
        "full_name": TEST_NAME,
        "role": "driver",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == TEST_EMAIL
    assert data["role"] == "driver"
    assert data["is_active"] is True


@pytest.mark.asyncio
async def test_register_duplicate_email(client):
    """Second registration with same email should fail."""
    response = await client.post("/api/auth/register", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD,
        "full_name": TEST_NAME,
        "role": "driver",
    })
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_login_valid(client):
    response = await client.post("/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD,
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == TEST_EMAIL


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    response = await client.post("/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": "WrongPassword!",
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_me_authenticated(client):
    # Login first
    login = await client.post("/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD,
    })
    token = login.json()["access_token"]

    response = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == TEST_EMAIL


@pytest.mark.asyncio
async def test_me_unauthenticated(client):
    response = await client.get("/api/auth/me")
    assert response.status_code == 401
