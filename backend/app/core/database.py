"""
Async SQLAlchemy engine, session factory, dependency injection, and automatic seeding.
Supports PostgreSQL (TimescaleDB / PostGIS) with automatic SQLite fallback for zero-downtime local runtimes.
"""
from __future__ import annotations

import logging
from typing import AsyncGenerator

from sqlalchemy import select
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Declarative base
# ---------------------------------------------------------------------------

class Base(DeclarativeBase):
    """All ORM models inherit from this base."""
    pass


# ---------------------------------------------------------------------------
# Engine & session factory builder
# ---------------------------------------------------------------------------

def _build_engine(database_url: str) -> AsyncEngine:
    if database_url.startswith("sqlite"):
        return create_async_engine(
            database_url,
            echo=settings.DEBUG,
            connect_args={"check_same_thread": False},
        )
    try:
        return create_async_engine(
            database_url,
            echo=settings.DEBUG,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
        )
    except (ModuleNotFoundError, ImportError) as err:
        logger.warning(
            "Database driver for %s not found (%s). Falling back to SQLite local database.",
            database_url,
            err,
        )
        return create_async_engine(
            "sqlite+aiosqlite:///./ecofleet.db",
            echo=settings.DEBUG,
            connect_args={"check_same_thread": False},
        )


engine: AsyncEngine = _build_engine(settings.DATABASE_URL)

AsyncSessionLocal: async_sessionmaker[AsyncSession] = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


# ---------------------------------------------------------------------------
# FastAPI dependency
# ---------------------------------------------------------------------------

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Yield an AsyncSession for each request, rolling back on error.
    Use as: ``db: AsyncSession = Depends(get_db)``
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


# ---------------------------------------------------------------------------
# Seed data
# ---------------------------------------------------------------------------

_SEED_TRUCKS = [
    {
        "truck_id": "TRUCK-01",
        "registration_number": "DL-1C-0001",
        "driver_name": "Ramesh Kumar",
        "driver_phone": "+91-9811001001",
        "capacity_kg": 5000,
        "zone": "South Delhi (MCD)",
        "is_active": True,
    },
    {
        "truck_id": "TRUCK-02",
        "registration_number": "DL-1C-0002",
        "driver_name": "Suresh Yadav",
        "driver_phone": "+91-9811001002",
        "capacity_kg": 5000,
        "zone": "South Delhi (MCD)",
        "is_active": True,
    },
    {
        "truck_id": "TRUCK-03",
        "registration_number": "DL-2C-1044",
        "driver_name": "Rajesh Sharma",
        "driver_phone": "+91-9811001003",
        "capacity_kg": 5500,
        "zone": "Central & New Delhi (NDMC)",
        "is_active": True,
    },
    {
        "truck_id": "TRUCK-04",
        "registration_number": "UP-16-BT-2026",
        "driver_name": "Vikram Pratap Singh",
        "driver_phone": "+91-9811001004",
        "capacity_kg": 5000,
        "zone": "Noida (Authority)",
        "is_active": True,
    },
    {
        "truck_id": "TRUCK-05",
        "registration_number": "UP-14-ET-4819",
        "driver_name": "Arun Tyagi",
        "driver_phone": "+91-9811001005",
        "capacity_kg": 4500,
        "zone": "Ghaziabad & East Delhi (GMC/EDMC)",
        "is_active": True,
    },
    {
        "truck_id": "TRUCK-06",
        "registration_number": "HR-26-DK-9012",
        "driver_name": "Manjeet Singh",
        "driver_phone": "+91-9811001006",
        "capacity_kg": 5500,
        "zone": "Gurugram (MCG)",
        "is_active": True,
    },
    {
        "truck_id": "TRUCK-07",
        "registration_number": "HR-55-AU-3180",
        "driver_name": "Virender Hooda",
        "driver_phone": "+91-9811001007",
        "capacity_kg": 5000,
        "zone": "Gurugram (MCG)",
        "is_active": True,
    },
    {
        "truck_id": "TRUCK-08",
        "registration_number": "DL-1C-0008",
        "driver_name": "Karan Verma",
        "driver_phone": "+91-9811001008",
        "capacity_kg": 4000,
        "zone": "Central & New Delhi (NDMC)",
        "is_active": True,
    },
]


# ---------------------------------------------------------------------------
# Table initialisation & Auto-Seeding
# ---------------------------------------------------------------------------

async def init_db() -> None:
    """
    Create all tables defined in the ORM models and seed default data.
    Called during application lifespan startup.
    """
    global engine, AsyncSessionLocal

    from app.core.security import get_password_hash
    from app.data.sample_nodes import SAMPLE_NODES
    from app.db import models as db_models

    # Try connecting to the primary database URL; fall back to SQLite if unreachable
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception as exc:
        logger.warning(
            "Primary database (%s) unavailable: %s. Falling back to SQLite local database.",
            settings.DATABASE_URL,
            exc,
        )
        sqlite_url = "sqlite+aiosqlite:///./ecofleet.db"
        engine = _build_engine(sqlite_url)
        AsyncSessionLocal.configure(bind=engine)
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    # Auto-seed initial data
    async with AsyncSessionLocal() as session:
        try:
            # 1. Seed Superuser
            user_stmt = select(db_models.User).limit(1)
            user_res = await session.execute(user_stmt)
            if not user_res.scalar_one_or_none():
                admin_user = db_models.User(
                    email=settings.FIRST_SUPERUSER_EMAIL.lower(),
                    hashed_password=get_password_hash(settings.FIRST_SUPERUSER_PASSWORD),
                    full_name=settings.FIRST_SUPERUSER_FULL_NAME,
                    role="admin",
                    is_active=True,
                )
                session.add(admin_user)
                logger.info("Seeded default superuser: %s", settings.FIRST_SUPERUSER_EMAIL)

            # 2. Seed Collection Nodes from SAMPLE_NODES (ensures full 50 nodes)
            existing_node_res = await session.execute(select(db_models.CollectionNodeModel.node_id))
            existing_node_ids = set(existing_node_res.scalars().all())
            added_nodes = 0
            for n in SAMPLE_NODES:
                if n["node_id"] not in existing_node_ids:
                    node = db_models.CollectionNodeModel(
                        node_id=n["node_id"],
                        name=n["name"],
                        zone=n["zone"],
                        latitude=n["latitude"],
                        longitude=n["longitude"],
                        capacity_kg=float(n["capacity_kg"]),
                        waste_types=n.get("waste_types", ["wet", "dry"]),
                        population_density=float(n.get("population_density", 20000)),
                    )
                    session.add(node)
                    added_nodes += 1
            if added_nodes > 0:
                logger.info("Seeded %d collection nodes into database.", added_nodes)

            # 3. Seed Trucks (ensures full 8 regional trucks)
            existing_truck_res = await session.execute(select(db_models.Truck.truck_id))
            existing_truck_ids = set(existing_truck_res.scalars().all())
            added_trucks = 0
            for t in _SEED_TRUCKS:
                if t["truck_id"] not in existing_truck_ids:
                    truck = db_models.Truck(**t)
                    session.add(truck)
                    added_trucks += 1
            if added_trucks > 0:
                logger.info("Seeded %d trucks into database.", added_trucks)

            await session.commit()
        except Exception as seed_err:
            logger.error("Error during database seeding: %s", seed_err)
            await session.rollback()

    logger.info("Database tables and seed data initialized successfully.")
