"""
Application configuration via environment variables.
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # App
    APP_NAME: str = "EcoFleet AI"
    DEBUG: bool = False

    # CORS — extend via CORS_ORIGINS env var in production
    # e.g. CORS_ORIGINS=["https://wastechakra.vercel.app","http://localhost:5173"]
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://localhost:80",
        "http://localhost",
    ]
    # Regex covers Vercel preview deployments (*.vercel.app) and Railway (*.railway.app)
    CORS_ORIGIN_REGEX: str = (
        r"https?://(localhost|127\.0\.0\.1)(:\d+)?"
        r"|https://[a-zA-Z0-9-]+-[a-zA-Z0-9]+\.vercel\.app"
        r"|https://[a-zA-Z0-9-]+\.up\.railway\.app"
    )

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://ecofleet:ecofleet@localhost:5432/ecofleet"

    # ML Model paths
    FORECAST_MODEL_PATH: str = "app/ml/models/waste_forecast_model.joblib"

    # Routing
    MAX_TRUCKS: int = 20
    TRUCK_CAPACITY_KG: int = 5000
    MAX_ROUTE_DURATION_HOURS: int = 8

    # External APIs
    WEATHER_API_KEY: str = ""
    GOOGLE_MAPS_API_KEY: str = ""

    # JWT / Security — no insecure default; must be set via .env in production
    JWT_SECRET_KEY: str = "dev-only-secret-key-replace-in-production-min-32-chars!!"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 100

    # Redis (optional — for rate limiting / caching)
    REDIS_URL: str = ""

    # First superuser seeding
    FIRST_SUPERUSER_EMAIL: str = "admin@ecofleet.ai"
    FIRST_SUPERUSER_PASSWORD: str = "EcoFleet@2026"
    FIRST_SUPERUSER_FULL_NAME: str = "EcoFleet Administrator"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
