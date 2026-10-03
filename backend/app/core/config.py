"""
Application configuration via environment variables.
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # App
    APP_NAME: str = "EcoFleet AI"
    DEBUG: bool = False

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://ecofleet:ecofleet@localhost:5432/ecofleet"

    # ML Model paths
    FORECAST_MODEL_PATH: str = "app/ml/models/waste_forecast_model.joblib"
    SCALER_PATH: str = "app/ml/models/feature_scaler.joblib"

    # Routing
    MAX_TRUCKS: int = 20
    TRUCK_CAPACITY_KG: int = 5000          # per truck
    MAX_ROUTE_DURATION_HOURS: int = 8

    # External APIs
    WEATHER_API_KEY: str = ""
    GOOGLE_MAPS_API_KEY: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
