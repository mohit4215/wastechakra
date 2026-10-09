"""
Pydantic models for Collection Nodes, Forecasts, and Routes.
"""
from __future__ import annotations
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
from datetime import datetime
from enum import Enum


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class WasteType(str, Enum):
    wet = "wet"
    dry = "dry"
    hazardous = "hazardous"


class RiskLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


# ---------------------------------------------------------------------------
# Collection Node
# ---------------------------------------------------------------------------

class CollectionNode(BaseModel):
    node_id: str = Field(..., description="Unique identifier for the collection node")
    name: str
    zone: str = Field(..., description="MCD administrative zone (e.g., 'South Delhi Zone 3')")
    latitude: float
    longitude: float
    capacity_kg: float = Field(..., description="Maximum bin capacity in kilograms")
    waste_types: List[WasteType] = [WasteType.wet, WasteType.dry]
    population_density: float = Field(..., description="People per sq km in surrounding area")
    last_collected_at: Optional[datetime] = None


class CollectionNodeList(BaseModel):
    nodes: List[CollectionNode]
    total: int


# ---------------------------------------------------------------------------
# Waste Volume Forecast
# ---------------------------------------------------------------------------

class ForecastRequest(BaseModel):
    node_id: str
    forecast_date: str = Field(..., description="ISO 8601 date string e.g. '2026-10-04'")
    weather_code: Optional[int] = Field(None, description="WMO weather code (0=clear, 61=rain, etc.)")
    is_festival: bool = False
    is_weekend: bool = False


class NodeForecast(BaseModel):
    node_id: str
    node_name: str
    forecast_date: str
    predicted_volume_kg: float
    capacity_kg: float
    fill_percentage: float
    risk_level: RiskLevel
    confidence: float = Field(..., ge=0.0, le=1.0)
    factors: dict = Field(default_factory=dict, description="Feature importances driving the forecast")


class ForecastResponse(BaseModel):
    forecast_date: str
    generated_at: datetime
    forecasts: List[NodeForecast]
    high_risk_count: int
    total_predicted_volume_kg: float


# ---------------------------------------------------------------------------
# Route Optimization
# ---------------------------------------------------------------------------

class RouteStop(BaseModel):
    stop_index: int
    node_id: str
    node_name: str
    latitude: float
    longitude: float
    predicted_volume_kg: float
    risk_level: RiskLevel
    estimated_arrival: Optional[str] = None


class TruckRoute(BaseModel):
    truck_id: str
    driver_name: Optional[str] = None
    total_distance_km: float
    total_waste_kg: float
    estimated_duration_hours: float
    stops: List[RouteStop]
    start_depot: str
    end_depot: str


class RoutingRequest(BaseModel):
    forecast_date: str
    zone: Optional[str] = None               # Filter to a specific MCD zone
    num_trucks: int = Field(5, ge=1, le=20)
    truck_capacity_kg: int = Field(5000, ge=500)
    skip_low_risk: bool = Field(True, description="Skip nodes predicted below 30% capacity")


class RoutingResponse(BaseModel):
    routing_date: str
    generated_at: datetime
    zone: Optional[str]
    total_routes: int
    total_nodes_serviced: int
    total_nodes_skipped: int
    total_distance_km: float
    estimated_fuel_saved_liters: float
    co2_saved_kg: float
    routes: List[TruckRoute]


# ---------------------------------------------------------------------------
# Fleet
# ---------------------------------------------------------------------------

class Truck(BaseModel):
    truck_id: str
    registration_number: str
    driver_name: str
    driver_phone: str
    capacity_kg: int
    zone: str
    is_active: bool = True


class FleetStatus(BaseModel):
    total_trucks: int
    active_trucks: int
    trucks: List[Truck]


# ---------------------------------------------------------------------------
# Auth Schemas
# ---------------------------------------------------------------------------

class UserRole(str, Enum):
    admin = "admin"
    manager = "manager"
    driver = "driver"


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.driver


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ---------------------------------------------------------------------------
# Node CRUD & Action Schemas
# ---------------------------------------------------------------------------

class CollectionNodeCreate(BaseModel):
    node_id: str
    name: str
    zone: str
    latitude: float
    longitude: float
    capacity_kg: float
    waste_types: List[WasteType] = [WasteType.wet, WasteType.dry]
    population_density: float = 20000.0


class CollectionNodeUpdate(BaseModel):
    name: Optional[str] = None
    zone: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    capacity_kg: Optional[float] = None
    waste_types: Optional[List[WasteType]] = None
    population_density: Optional[float] = None


class BinCollectAction(BaseModel):
    collected_kg: Optional[float] = None
    notes: Optional[str] = None


# ---------------------------------------------------------------------------
# Dispatch & Real-time Execution Schemas
# ---------------------------------------------------------------------------

class DispatchRouteRequest(BaseModel):
    routing_date: str
    zone: Optional[str] = None
    routes: List[TruckRoute]
    notes: Optional[str] = None


class DispatchResponse(BaseModel):
    session_id: int
    status: str
    dispatched_at: datetime
    routes_count: int
    message: str


class StopStatusUpdate(BaseModel):
    truck_id: str
    stop_index: int
    status: str = Field("completed", description="pending, in_progress, completed, skipped")
    collected_kg: Optional[float] = None


# ---------------------------------------------------------------------------
# Citizen Overflow / Bin Issue Report
# ---------------------------------------------------------------------------

class CitizenReport(BaseModel):
    node_id: str
    reporter_name: Optional[str] = "Citizen"
    reporter_phone: Optional[str] = None
    issue_type: str = Field("overflow", description="overflow, damaged_bin, odor, street_waste")
    description: Optional[str] = None
    estimated_overflow_kg: Optional[float] = 100.0

