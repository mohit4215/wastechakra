"""
API Route: /api/fleet — Fleet and truck management (DB-backed with in-memory fallback)
"""
from __future__ import annotations

import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user_token, require_role, TokenData
from app.db.models import Truck as TruckModel
from app.models.schemas import FleetStatus, Truck

logger = logging.getLogger(__name__)

router = APIRouter()

# In-memory fallback (used if DB unavailable)
_FALLBACK_TRUCKS = [
    {
        "truck_id": "TRUCK-01",
        "registration_number": "DL-1C-0001",
        "driver_name": "Ramesh Kumar",
        "driver_phone": "+91-9811001001",
        "capacity_kg": 5000,
        "zone": "South Delhi Zone 3",
        "is_active": True,
    },
    {
        "truck_id": "TRUCK-02",
        "registration_number": "DL-1C-0002",
        "driver_name": "Suresh Yadav",
        "driver_phone": "+91-9811001002",
        "capacity_kg": 5000,
        "zone": "South Delhi Zone 3",
        "is_active": True,
    },
    {
        "truck_id": "TRUCK-03",
        "registration_number": "DL-1C-0003",
        "driver_name": "Mohan Singh",
        "driver_phone": "+91-9811001003",
        "capacity_kg": 4000,
        "zone": "South Delhi Zone 4",
        "is_active": True,
    },
    {
        "truck_id": "TRUCK-04",
        "registration_number": "DL-1C-0004",
        "driver_name": "Vijay Sharma",
        "driver_phone": "+91-9811001004",
        "capacity_kg": 5000,
        "zone": "South Delhi Zone 4",
        "is_active": False,
    },
    {
        "truck_id": "TRUCK-05",
        "registration_number": "DL-1C-0005",
        "driver_name": "Arun Gupta",
        "driver_phone": "+91-9811001005",
        "capacity_kg": 3000,
        "zone": "South Delhi Zone 3",
        "is_active": True,
    },
]


class TruckUpdate(BaseModel):
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None
    capacity_kg: Optional[int] = None
    zone: Optional[str] = None
    is_active: Optional[bool] = None


async def _db_trucks(db: AsyncSession) -> List[TruckModel]:
    """Load all trucks from DB, returning empty list on error."""
    try:
        stmt = select(TruckModel).order_by(TruckModel.truck_id)
        res = await db.execute(stmt)
        return list(res.scalars().all())
    except Exception as exc:
        logger.debug("DB truck read failed: %s", exc)
        return []


def _to_schema(t: TruckModel) -> Truck:
    return Truck(
        truck_id=t.truck_id,
        registration_number=t.registration_number,
        driver_name=t.driver_name,
        driver_phone=t.driver_phone,
        capacity_kg=t.capacity_kg,
        zone=t.zone,
        is_active=t.is_active,
    )


@router.get("/", response_model=FleetStatus, summary="Get fleet status")
async def fleet_status(db: AsyncSession = Depends(get_db)):
    """Return the current fleet status for all registered trucks."""
    db_list = await _db_trucks(db)
    if db_list:
        trucks = [_to_schema(t) for t in db_list]
    else:
        trucks = [Truck(**t) for t in _FALLBACK_TRUCKS]

    active = sum(1 for t in trucks if t.is_active)
    return FleetStatus(total_trucks=len(trucks), active_trucks=active, trucks=trucks)


@router.post(
    "/",
    response_model=Truck,
    status_code=status.HTTP_201_CREATED,
    summary="Add new truck",
    dependencies=[Depends(require_role("admin", "manager"))],
)
async def add_truck(truck: Truck, db: AsyncSession = Depends(get_db)):
    """Add a new garbage truck to the municipal fleet (admin/manager only)."""
    try:
        stmt = select(TruckModel).where(TruckModel.truck_id == truck.truck_id)
        res = await db.execute(stmt)
        if res.scalar_one_or_none():
            raise HTTPException(status_code=400, detail=f"Truck '{truck.truck_id}' already registered.")

        new_truck = TruckModel(
            truck_id=truck.truck_id,
            registration_number=truck.registration_number,
            driver_name=truck.driver_name,
            driver_phone=truck.driver_phone,
            capacity_kg=truck.capacity_kg,
            zone=truck.zone,
            is_active=truck.is_active,
        )
        db.add(new_truck)
        await db.commit()
        await db.refresh(new_truck)
        return _to_schema(new_truck)
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Failed to add truck: %s", exc)
        raise HTTPException(status_code=500, detail="Failed to add truck.")


@router.patch(
    "/{truck_id}",
    response_model=Truck,
    summary="Update truck or toggle maintenance",
    dependencies=[Depends(require_role("admin", "manager"))],
)
async def update_truck(truck_id: str, body: TruckUpdate, db: AsyncSession = Depends(get_db)):
    """Update driver details or toggle active/maintenance status (admin/manager only)."""
    try:
        stmt = select(TruckModel).where(TruckModel.truck_id == truck_id)
        res = await db.execute(stmt)
        truck = res.scalar_one_or_none()
        if truck:
            if body.driver_name is not None:
                truck.driver_name = body.driver_name
            if body.driver_phone is not None:
                truck.driver_phone = body.driver_phone
            if body.capacity_kg is not None:
                truck.capacity_kg = body.capacity_kg
            if body.zone is not None:
                truck.zone = body.zone
            if body.is_active is not None:
                truck.is_active = body.is_active
            await db.commit()
            await db.refresh(truck)
            return _to_schema(truck)
    except Exception as exc:
        logger.error("Failed to update truck %s: %s", truck_id, exc)

    raise HTTPException(status_code=404, detail=f"Truck '{truck_id}' not found")


@router.delete(
    "/{truck_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Decommission truck",
    dependencies=[Depends(require_role("admin"))],
)
async def delete_truck(truck_id: str, db: AsyncSession = Depends(get_db)):
    """Decommission a truck from the fleet (admin only)."""
    try:
        stmt = delete(TruckModel).where(TruckModel.truck_id == truck_id)
        result = await db.execute(stmt)
        await db.commit()
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail=f"Truck '{truck_id}' not found")
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Failed to delete truck %s: %s", truck_id, exc)
        raise HTTPException(status_code=500, detail="Failed to delete truck.")
    return None
