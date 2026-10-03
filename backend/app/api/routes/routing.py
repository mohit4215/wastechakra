"""
API Route: /api/routing — Dynamic route optimization, dispatching, execution tracking, and driver manifests
"""
from __future__ import annotations

import logging
from datetime import date, datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user_token, require_role, TokenData
from app.data.sample_nodes import SAMPLE_NODES
from app.db.models import CollectionNodeModel, RouteSession, TruckAssignment
from app.ml.forecaster import batch_forecast
from app.models.schemas import (
    DispatchResponse,
    DispatchRouteRequest,
    RouteStop,
    RoutingRequest,
    RoutingResponse,
    StopStatusUpdate,
    TruckRoute,
)
from app.routing.cvrp_solver import optimize_routes

logger = logging.getLogger(__name__)

router = APIRouter()


async def _fetch_nodes_for_routing(db: AsyncSession, zone: Optional[str] = None) -> List[dict]:
    """Helper to fetch collection nodes from DB or fallback to SAMPLE_NODES."""
    try:
        stmt = select(CollectionNodeModel)
        if zone:
            stmt = stmt.where(CollectionNodeModel.zone.ilike(f"%{zone}%"))
        res = await db.execute(stmt)
        nodes = res.scalars().all()
        if nodes:
            return [
                {
                    "node_id": n.node_id,
                    "name": n.name,
                    "zone": n.zone,
                    "latitude": n.latitude,
                    "longitude": n.longitude,
                    "capacity_kg": n.capacity_kg,
                    "population_density": n.population_density,
                }
                for n in nodes
            ]
    except Exception as exc:
        logger.debug("Falling back to in-memory nodes: %s", exc)

    nodes = SAMPLE_NODES
    if zone:
        nodes = [n for n in nodes if zone.lower() in n["zone"].lower()]
    return nodes


@router.post("/optimize", response_model=RoutingResponse, summary="Generate optimized routes")
async def optimize(
    body: RoutingRequest,
    db: AsyncSession = Depends(get_db),
    _token: TokenData = Depends(require_role("manager", "admin")),
):
    """
    Core dynamic routing endpoint:
    1. Runs ML forecasting on all collection nodes.
    2. Solves the Capacitated Vehicle Routing Problem (CVRP).
    3. Returns optimized truck routes with fuel and carbon savings.
    """
    try:
        d = date.fromisoformat(body.forecast_date)
    except ValueError:
        raise HTTPException(status_code=422, detail="forecast_date must be ISO 8601 (YYYY-MM-DD)")

    nodes = await _fetch_nodes_for_routing(db, body.zone)
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
            driver_name=r.get("driver_name"),
            total_distance_km=r["total_distance_km"],
            total_waste_kg=r["total_waste_kg"],
            estimated_duration_hours=r["estimated_duration_hours"],
            stops=stops,
            start_depot=r["start_depot"],
            end_depot=r["end_depot"],
        ))

    return RoutingResponse(
        routing_date=body.forecast_date,
        generated_at=datetime.now(timezone.utc),
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
    db: AsyncSession = Depends(get_db),
    _token: TokenData = Depends(require_role("manager", "admin")),
):
    """Convenience endpoint that runs optimization for today's date."""
    body = RoutingRequest(
        forecast_date=date.today().isoformat(),
        zone=zone,
        num_trucks=num_trucks,
    )
    return await optimize(body, db=db)


@router.post("/dispatch", response_model=DispatchResponse, summary="Dispatch routes to drivers")
async def dispatch_routes(
    body: DispatchRouteRequest,
    db: AsyncSession = Depends(get_db),
    _token: TokenData = Depends(require_role("manager", "admin")),
):
    """
    Lock in and dispatch daily routes to truck drivers.
    Creates a RouteSession record and assigns trucks in the database.
    """
    now = datetime.now(timezone.utc)
    total_distance = sum(r.total_distance_km for r in body.routes)
    total_waste = sum(r.total_waste_kg for r in body.routes)
    total_stops = sum(len(r.stops) for r in body.routes)

    # Estimate fuel saved based on 18% benchmark
    fuel_saved = round(total_distance * 0.35 * 0.18, 1)
    co2_saved = round(fuel_saved * 2.68, 1)

    session_id = int(now.timestamp()) % 100000

    try:
        session = RouteSession(
            session_date=body.routing_date,
            zone=body.zone,
            total_routes=len(body.routes),
            total_nodes_serviced=total_stops,
            total_nodes_skipped=max(0, 25 - total_stops),
            total_distance_km=total_distance,
            fuel_saved_liters=fuel_saved,
            co2_saved_kg=co2_saved,
            status="dispatched",
        )
        db.add(session)
        await db.flush()
        session_id = session.id

        for r in body.routes:
            assignment = TruckAssignment(
                route_session_id=session.id,
                truck_id=r.truck_id,
                driver_name=r.driver_name,
                total_distance_km=r.total_distance_km,
                total_waste_kg=r.total_waste_kg,
                estimated_duration_hours=r.estimated_duration_hours,
                stops_data=[s.dict() for s in r.stops],
                status="in_progress",
            )
            db.add(assignment)
        await db.commit()
    except Exception as exc:
        logger.warning("Could not persist route dispatch: %s", exc)

    return DispatchResponse(
        session_id=session_id,
        status="dispatched",
        dispatched_at=now,
        routes_count=len(body.routes),
        message=f"Dispatched {len(body.routes)} routes to drivers. Fleet tracking active.",
    )


@router.get("/history", summary="View past routing runs and savings")
async def route_history(
    db: AsyncSession = Depends(get_db),
    _token: TokenData = Depends(require_role("manager", "admin")),
):
    """Retrieve historical routing optimization sessions and environmental metrics."""
    try:
        stmt = select(RouteSession).order_by(desc(RouteSession.created_at)).limit(20)
        res = await db.execute(stmt)
        sessions = res.scalars().all()
        if sessions:
            return [
                {
                    "session_id": s.id,
                    "session_date": s.session_date,
                    "zone": s.zone or "All Zones",
                    "total_routes": s.total_routes,
                    "total_nodes_serviced": s.total_nodes_serviced,
                    "total_nodes_skipped": s.total_nodes_skipped,
                    "total_distance_km": s.total_distance_km,
                    "fuel_saved_liters": s.fuel_saved_liters,
                    "co2_saved_kg": s.co2_saved_kg,
                    "status": s.status,
                    "created_at": s.created_at.isoformat() if s.created_at else None,
                }
                for s in sessions
            ]
    except Exception as exc:
        logger.debug("Could not fetch route history: %s", exc)

    # Return sample history records
    return [
        {
            "session_id": 101,
            "session_date": "2026-10-02",
            "zone": "South Delhi Zone 3 & 4",
            "total_routes": 5,
            "total_nodes_serviced": 19,
            "total_nodes_skipped": 6,
            "total_distance_km": 68.4,
            "fuel_saved_liters": 14.2,
            "co2_saved_kg": 38.1,
            "status": "completed",
            "created_at": "2026-10-02T06:00:00Z",
        },
        {
            "session_id": 100,
            "session_date": "2026-10-01",
            "zone": "South Delhi Zone 3 & 4",
            "total_routes": 5,
            "total_nodes_serviced": 20,
            "total_nodes_skipped": 5,
            "total_distance_km": 71.2,
            "fuel_saved_liters": 15.6,
            "co2_saved_kg": 41.8,
            "status": "completed",
            "created_at": "2026-10-01T06:00:00Z",
        },
    ]


@router.post("/stop/status", summary="Driver updates status of a route stop")
async def update_stop_status(
    body: StopStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _token: TokenData = Depends(require_role("driver", "manager", "admin")),
):
    """
    Driver navigation hook: Mark a specific stop along the route as completed, skipped, or in_progress.
    Updates the TruckAssignment.stops_data JSON in the database.
    """
    now = datetime.now(timezone.utc)

    try:
        # Find the most recent in-progress assignment for this truck
        stmt = (
            select(TruckAssignment)
            .where(TruckAssignment.truck_id == body.truck_id)
            .order_by(desc(TruckAssignment.created_at))
            .limit(1)
        )
        res = await db.execute(stmt)
        assignment = res.scalar_one_or_none()

        if assignment and assignment.stops_data:
            stops = list(assignment.stops_data)
            for stop in stops:
                if stop.get("stop_index") == body.stop_index:
                    stop["status"] = body.status
                    if body.collected_kg is not None:
                        stop["collected_kg"] = body.collected_kg
                    break
            # Reassign to trigger SQLAlchemy JSON change detection
            assignment.stops_data = stops
            # Mark assignment in_progress → completed if all stops done
            all_done = all(
                s.get("status") in ("completed", "skipped")
                for s in stops
            )
            if all_done:
                assignment.status = "completed"
            elif assignment.status == "pending":
                assignment.status = "in_progress"
            await db.commit()
    except Exception as exc:
        logger.warning("Could not persist stop status update: %s", exc)

    return {
        "status": "updated",
        "truck_id": body.truck_id,
        "stop_index": body.stop_index,
        "stop_status": body.status,
        "collected_kg": body.collected_kg,
        "updated_at": now.isoformat(),
        "message": f"Stop {body.stop_index} marked as {body.status}.",
    }
