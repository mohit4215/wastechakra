"""
API Route: /api/routing — Dynamic route optimization
"""
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from app.data.sample_nodes import SAMPLE_NODES
from app.ml.forecaster import batch_forecast
from app.routing.cvrp_solver import optimize_routes
from app.models.schemas import RoutingRequest, RoutingResponse, TruckRoute, RouteStop

router = APIRouter()


@router.post("/optimize", response_model=RoutingResponse, summary="Generate optimized routes")
async def optimize(body: RoutingRequest):
    """
    **Core endpoint.** Given a date (and optional zone filter), this:
    1. Runs ML forecasting on all collection nodes
    2. Feeds predictions into the CVRP solver
    3. Returns optimized truck routes with skipped-node and savings statistics
    """
    try:
        from datetime import date
        d = date.fromisoformat(body.forecast_date)
    except ValueError:
        raise HTTPException(status_code=422, detail="forecast_date must be ISO 8601 (YYYY-MM-DD)")

    nodes = SAMPLE_NODES
    if body.zone:
        nodes = [n for n in nodes if body.zone.lower() in n["zone"].lower()]
    if not nodes:
        raise HTTPException(status_code=404, detail=f"No nodes for zone '{body.zone}'")

    # Step 1 — Forecast
    forecasts = batch_forecast(nodes, d)

    # Step 2 — Enrich forecasts with lat/lon for routing
    node_map = {n["node_id"]: n for n in nodes}
    for f in forecasts:
        n = node_map[f["node_id"]]
        f["latitude"] = n["latitude"]
        f["longitude"] = n["longitude"]

    # Step 3 — Route optimisation
    result = optimize_routes(
        forecasts,
        num_trucks=body.num_trucks,
        truck_capacity_kg=body.truck_capacity_kg,
        skip_low_risk=body.skip_low_risk,
    )

    # Step 4 — Serialise
    routes = []
    for r in result["routes"]:
        stops = [RouteStop(**s) for s in r["stops"]]
        routes.append(TruckRoute(
            truck_id=r["truck_id"],
            total_distance_km=r["total_distance_km"],
            total_waste_kg=r["total_waste_kg"],
            estimated_duration_hours=r["estimated_duration_hours"],
            stops=stops,
            start_depot=r["start_depot"],
            end_depot=r["end_depot"],
        ))

    return RoutingResponse(
        routing_date=body.forecast_date,
        generated_at=datetime.utcnow(),
        zone=body.zone,
        total_routes=len(routes),
        total_nodes_serviced=result["total_nodes_serviced"],
        total_nodes_skipped=result["total_nodes_skipped"],
        total_distance_km=result["total_distance_km"],
        estimated_fuel_saved_liters=result["estimated_fuel_saved_liters"],
        co2_saved_kg=result["co2_saved_kg"],
        routes=routes,
    )


@router.get("/today", response_model=RoutingResponse, summary="Get today's optimized routes")
async def today_routes(
    zone: Optional[str] = Query(None),
    num_trucks: int = Query(5, ge=1, le=20),
):
    """Convenience endpoint that runs optimization for today's date."""
    from datetime import date
    body = RoutingRequest(
        forecast_date=date.today().isoformat(),
        zone=zone,
        num_trucks=num_trucks,
    )
    return await optimize(body)
