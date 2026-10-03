"""
EcoFleet AI — FastAPI Application Entry Point
Production-ready API for Municipal Waste Management and Predictive Routing.
Built for WasteChakra 2026 — AI for Smart Municipal Governance.
"""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.api.routes import analytics, auth, fleet, forecast, nodes, routing
from app.core.config import settings
from app.core.database import init_db

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("ecofleet")

# ---------------------------------------------------------------------------
# Rate limiter (in-memory; swap storage_uri for Redis in production)
# ---------------------------------------------------------------------------
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager for startup and shutdown hooks."""
    logger.info("Starting EcoFleet AI Backend...")
    try:
        await init_db()
    except Exception as exc:
        logger.error("Database initialization notice: %s", exc)
    yield
    logger.info("EcoFleet AI Backend shutting down...")


app = FastAPI(
    title="EcoFleet AI",
    description=(
        "Dynamic Predictive Routing Engine for Municipal Waste Management. "
        "Built for WasteChakra 2026 — AI for Smart Municipal Governance. "
        "Provides ML-driven volume forecasting, Capacitated Vehicle Routing Problem (CVRP) "
        "optimization, fleet management, and SWM Rules 2026 compliance analytics."
    ),
    version="1.0.0",
    lifespan=lifespan,
    contact={
        "name": "Team Love Nature — Mohit Agarwal",
        "url": "https://github.com/mohit4215/wastechakra",
    },
)

# ---------------------------------------------------------------------------
# Rate limiting
# ---------------------------------------------------------------------------
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ---------------------------------------------------------------------------
# CORS — allow frontend origins
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["http://localhost:5173"],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(auth.router,      prefix="/api/auth",      tags=["Authentication"])
app.include_router(nodes.router,     prefix="/api/nodes",     tags=["Collection Nodes"])
app.include_router(forecast.router,  prefix="/api/forecast",  tags=["Forecasting"])
app.include_router(routing.router,   prefix="/api/routing",   tags=["Route Optimization"])
app.include_router(fleet.router,     prefix="/api/fleet",     tags=["Fleet"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Municipal Analytics"])


@app.get("/", include_in_schema=False)
async def root():
    return JSONResponse(
        content={
            "service": "EcoFleet AI",
            "version": "1.0.0",
            "status": "operational",
            "docs": "/docs",
            "team": "Love Nature — WasteChakra 2026",
            "features": [
                "ML Waste Volume Forecasting",
                "CVRP Dynamic Route Optimization",
                "Driver Navigation & Manifests",
                "Citizen Overflow Reporting",
                "SWM Rules 2026 ESG Compliance",
            ],
        }
    )


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "service": "ecofleet-backend",
        "environment": "development" if settings.DEBUG else "production",
    }
