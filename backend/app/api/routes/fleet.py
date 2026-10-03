"""
API Route: /api/fleet — Fleet and truck management
"""
from fastapi import APIRouter
from app.models.schemas import FleetStatus, Truck

router = APIRouter()

# Sample fleet data
_TRUCKS = [
    {"truck_id": "TRUCK-01", "registration_number": "DL-1C-0001", "driver_name": "Ramesh Kumar",
     "driver_phone": "+91-9811001001", "capacity_kg": 5000, "zone": "South Delhi Zone 3", "is_active": True},
    {"truck_id": "TRUCK-02", "registration_number": "DL-1C-0002", "driver_name": "Suresh Yadav",
     "driver_phone": "+91-9811001002", "capacity_kg": 5000, "zone": "South Delhi Zone 3", "is_active": True},
    {"truck_id": "TRUCK-03", "registration_number": "DL-1C-0003", "driver_name": "Mohan Singh",
     "driver_phone": "+91-9811001003", "capacity_kg": 4000, "zone": "South Delhi Zone 4", "is_active": True},
    {"truck_id": "TRUCK-04", "registration_number": "DL-1C-0004", "driver_name": "Vijay Sharma",
     "driver_phone": "+91-9811001004", "capacity_kg": 5000, "zone": "South Delhi Zone 4", "is_active": False},
    {"truck_id": "TRUCK-05", "registration_number": "DL-1C-0005", "driver_name": "Arun Gupta",
     "driver_phone": "+91-9811001005", "capacity_kg": 3000, "zone": "South Delhi Zone 3", "is_active": True},
]


@router.get("/", response_model=FleetStatus, summary="Get fleet status")
async def fleet_status():
    """Return the current fleet status for all registered trucks."""
    trucks = [Truck(**t) for t in _TRUCKS]
    active = sum(1 for t in trucks if t.is_active)
    return FleetStatus(total_trucks=len(trucks), active_trucks=active, trucks=trucks)
