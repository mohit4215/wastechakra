"""
SQLAlchemy ORM models for EcoFleet AI.
Supports PostgreSQL (TimescaleDB / PostGIS) with SQLite compatibility for standalone runtimes.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="driver", nullable=False)  # "admin", "manager", "driver"
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class CollectionNodeModel(Base):
    __tablename__ = "collection_nodes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    node_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    zone = Column(String(100), index=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    capacity_kg = Column(Float, nullable=False)
    waste_types = Column(JSON, default=list, nullable=False)
    population_density = Column(Float, nullable=False)
    last_collected_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class WasteLog(Base):
    __tablename__ = "waste_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    node_id = Column(String(50), index=True, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True, nullable=False)
    actual_waste_kg = Column(Float, nullable=False)
    fill_percentage = Column(Float, nullable=False)
    weather_code = Column(Integer, default=0, nullable=False)
    is_festival = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)


class RouteSession(Base):
    __tablename__ = "route_sessions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_date = Column(String(20), index=True, nullable=False)
    zone = Column(String(100), nullable=True)
    total_routes = Column(Integer, default=0, nullable=False)
    total_nodes_serviced = Column(Integer, default=0, nullable=False)
    total_nodes_skipped = Column(Integer, default=0, nullable=False)
    total_distance_km = Column(Float, default=0.0, nullable=False)
    fuel_saved_liters = Column(Float, default=0.0, nullable=False)
    co2_saved_kg = Column(Float, default=0.0, nullable=False)
    status = Column(String(50), default="optimized", nullable=False)  # optimized, dispatched, completed
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    assignments = relationship("TruckAssignment", back_populates="session", cascade="all, delete-orphan")


class TruckAssignment(Base):
    __tablename__ = "truck_assignments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    route_session_id = Column(Integer, ForeignKey("route_sessions.id", ondelete="CASCADE"), nullable=False)
    truck_id = Column(String(50), index=True, nullable=False)
    driver_name = Column(String(100), nullable=True)
    total_distance_km = Column(Float, default=0.0, nullable=False)
    total_waste_kg = Column(Float, default=0.0, nullable=False)
    estimated_duration_hours = Column(Float, default=0.0, nullable=False)
    stops_data = Column(JSON, nullable=False)  # list of stops with status
    status = Column(String(50), default="pending", nullable=False)  # pending, in_progress, completed
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    session = relationship("RouteSession", back_populates="assignments")


class Truck(Base):
    __tablename__ = "trucks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    truck_id = Column(String(50), unique=True, index=True, nullable=False)
    registration_number = Column(String(50), unique=True, nullable=False)
    driver_name = Column(String(100), nullable=False)
    driver_phone = Column(String(20), nullable=False)
    capacity_kg = Column(Integer, nullable=False)
    zone = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
