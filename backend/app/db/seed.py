"""
Database Seeding Script for EcoFleet AI.
Populates:
1. Superuser Administrator (admin@ecofleet.ai)
2. 50 Delhi NCR Benchmark Collection Points
3. 8 Regional Fleet Trucks (DL, UP, HR)
4. 90-day Historical Waste Logs for telemetry & ML forecasting
5. Recent Route Optimization Sessions & Fleet Manifests

Can be executed directly:
    python -m app.db.seed
"""
import asyncio
import logging
import random
from datetime import datetime, timedelta, timezone

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import AsyncSessionLocal, Base, engine, _SEED_TRUCKS
from app.core.security import get_password_hash
from app.data.sample_nodes import SAMPLE_NODES
from app.db import models as db_models

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("ecofleet.seed")


async def seed_superuser(session: AsyncSession) -> None:
    res = await session.execute(select(db_models.User).where(db_models.User.email == settings.FIRST_SUPERUSER_EMAIL.lower()))
    if not res.scalar_one_or_none():
        admin = db_models.User(
            email=settings.FIRST_SUPERUSER_EMAIL.lower(),
            hashed_password=get_password_hash(settings.FIRST_SUPERUSER_PASSWORD),
            full_name=settings.FIRST_SUPERUSER_FULL_NAME,
            role="admin",
            is_active=True,
        )
        session.add(admin)
        logger.info("Created superuser: %s", settings.FIRST_SUPERUSER_EMAIL)
    else:
        logger.info("Superuser already exists: %s", settings.FIRST_SUPERUSER_EMAIL)


async def seed_collection_nodes(session: AsyncSession) -> int:
    existing_res = await session.execute(select(db_models.CollectionNodeModel.node_id))
    existing_ids = set(existing_res.scalars().all())
    added = 0
    for node_data in SAMPLE_NODES:
        if node_data["node_id"] not in existing_ids:
            node = db_models.CollectionNodeModel(
                node_id=node_data["node_id"],
                name=node_data["name"],
                zone=node_data["zone"],
                latitude=node_data["latitude"],
                longitude=node_data["longitude"],
                capacity_kg=float(node_data["capacity_kg"]),
                waste_types=node_data.get("waste_types", ["wet", "dry"]),
                population_density=float(node_data.get("population_density", 25000)),
            )
            session.add(node)
            added += 1
    logger.info("Seeded %d new collection nodes (Total configured: %d)", added, len(SAMPLE_NODES))
    return added


async def seed_fleet_trucks(session: AsyncSession) -> int:
    existing_res = await session.execute(select(db_models.Truck.truck_id))
    existing_ids = set(existing_res.scalars().all())
    added = 0
    for truck_data in _SEED_TRUCKS:
        if truck_data["truck_id"] not in existing_ids:
            truck = db_models.Truck(**truck_data)
            session.add(truck)
            added += 1
    logger.info("Seeded %d new fleet trucks (Total configured: %d)", added, len(_SEED_TRUCKS))
    return added


async def seed_historical_waste_logs(session: AsyncSession, days: int = 90) -> int:
    count_res = await session.execute(select(func.count(db_models.WasteLog.id)))
    existing_count = count_res.scalar() or 0
    if existing_count >= 500:
        logger.info("Historical waste logs already present (%d logs). Skipping generation.", existing_count)
        return 0

    now = datetime.now(timezone.utc)
    logs_added = 0

    for i in range(days, 0, -1):
        day_date = now - timedelta(days=i)
        day_of_week = day_date.weekday()
        is_weekend = day_of_week in [5, 6]
        # Occasional synthetic weather or festival signals
        is_festival = (i % 28 == 0)
        weather_code = 61 if (i % 17 == 0) else 0

        # Sample 20-30 nodes per day to simulate historical collection runs
        daily_nodes = random.sample(SAMPLE_NODES, k=min(25, len(SAMPLE_NODES)))
        for node in daily_nodes:
            cap = float(node["capacity_kg"])
            density_factor = 0.8 + (float(node.get("population_density", 25000)) / 50000.0) * 0.4
            weekend_factor = 1.15 if is_weekend else 1.0
            festival_factor = 1.35 if is_festival else 1.0
            weather_factor = 1.20 if weather_code > 0 else 1.0

            base_kg = cap * 0.65 * density_factor * weekend_factor * festival_factor * weather_factor
            actual_kg = round(min(cap * 1.25, base_kg * random.uniform(0.85, 1.15)), 1)
            fill_pct = round((actual_kg / cap) * 100.0, 1)

            log_entry = db_models.WasteLog(
                node_id=node["node_id"],
                timestamp=day_date.replace(hour=random.randint(6, 14), minute=random.randint(0, 59)),
                actual_waste_kg=actual_kg,
                fill_percentage=fill_pct,
                weather_code=weather_code,
                is_festival=is_festival,
            )
            session.add(log_entry)
            logs_added += 1

    logger.info("Generated %d synthetic historical waste collection logs across %d days.", logs_added, days)
    return logs_added


async def seed_route_sessions(session: AsyncSession) -> None:
    session_count_res = await session.execute(select(func.count(db_models.RouteSession.id)))
    if (session_count_res.scalar() or 0) > 0:
        return

    now = datetime.now(timezone.utc)
    for days_ago in range(5, -1, -1):
        s_date = (now - timedelta(days=days_ago)).strftime("%Y-%m-%d")
        session_obj = db_models.RouteSession(
            session_date=s_date,
            zone="All Delhi NCR Zones",
            total_routes=6,
            total_nodes_serviced=42,
            total_nodes_skipped=8,
            total_distance_km=round(112.4 + days_ago * 4.2, 1),
            fuel_saved_liters=round(34.8 + days_ago * 1.5, 1),
            co2_saved_kg=round(93.2 + days_ago * 4.0, 1),
            status="completed" if days_ago > 0 else "optimized",
        )
        session.add(session_obj)

    logger.info("Seeded 6 past route optimization sessions.")


async def run_all_seeds() -> None:
    logger.info("Initializing database tables and fallback engines...")
    from app.core import database as db_core
    await db_core.init_db()

    async with db_core.AsyncSessionLocal() as session:
        try:
            await seed_superuser(session)
            await seed_collection_nodes(session)
            await seed_fleet_trucks(session)
            await seed_historical_waste_logs(session, days=90)
            await seed_route_sessions(session)
            await session.commit()
            logger.info("✅ All EcoFleet AI database tables and seed data populated successfully!")
        except Exception as e:
            logger.error("Database seeding encountered an error: %s", e)
            await session.rollback()
            raise


if __name__ == "__main__":
    asyncio.run(run_all_seeds())
