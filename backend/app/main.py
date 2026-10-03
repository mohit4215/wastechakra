"""
EcoFleet AI — FastAPI Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import forecast, routing, nodes, fleet
from app.core.config import settings

app = FastAPI(
    title="EcoFleet AI",
    description=(
        "Dynamic Predictive Routing Engine for Municipal Waste Management. "
        "Built for WasteChakra 2026 — AI for Smart Municipal Governance."
    ),
    version="1.0.0",
    contact={
        "name": "Team Love Nature — Mohit Agarwal",
        "url": "https://github.com/mohit4215/wastechakra",
    },
)

# ---------------------------------------------------------------------------
# CORS — allow the React frontend (dev + prod)
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(nodes.router,    prefix="/api/nodes",    tags=["Collection Nodes"])
app.include_router(forecast.router, prefix="/api/forecast", tags=["Forecasting"])
app.include_router(routing.router,  prefix="/api/routing",  tags=["Route Optimization"])
app.include_router(fleet.router,    prefix="/api/fleet",    tags=["Fleet"])


@app.get("/", include_in_schema=False)
async def root():
    return JSONResponse(
        content={
            "service": "EcoFleet AI",
            "status": "operational",
            "docs": "/docs",
            "team": "Love Nature — WasteChakra 2026",
        }
    )


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok"}
