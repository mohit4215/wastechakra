"""Initial EcoFleet schema

Revision ID: 20261011_0001
Revises:
Create Date: 2026-10-11 00:00:00
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20261011_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=50), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)

    op.create_table(
        "collection_nodes",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("node_id", sa.String(length=50), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("zone", sa.String(length=100), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("capacity_kg", sa.Float(), nullable=False),
        sa.Column("waste_types", sa.JSON(), nullable=False),
        sa.Column("population_density", sa.Float(), nullable=False),
        sa.Column("last_collected_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_collection_nodes_id"), "collection_nodes", ["id"], unique=False)
    op.create_index(op.f("ix_collection_nodes_node_id"), "collection_nodes", ["node_id"], unique=True)
    op.create_index(op.f("ix_collection_nodes_zone"), "collection_nodes", ["zone"], unique=False)

    op.create_table(
        "waste_logs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("node_id", sa.String(length=50), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("actual_waste_kg", sa.Float(), nullable=False),
        sa.Column("fill_percentage", sa.Float(), nullable=False),
        sa.Column("weather_code", sa.Integer(), nullable=False),
        sa.Column("is_festival", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_waste_logs_id"), "waste_logs", ["id"], unique=False)
    op.create_index(op.f("ix_waste_logs_node_id"), "waste_logs", ["node_id"], unique=False)
    op.create_index(op.f("ix_waste_logs_timestamp"), "waste_logs", ["timestamp"], unique=False)

    op.create_table(
        "route_sessions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("session_date", sa.String(length=20), nullable=False),
        sa.Column("zone", sa.String(length=100), nullable=True),
        sa.Column("total_routes", sa.Integer(), nullable=False),
        sa.Column("total_nodes_serviced", sa.Integer(), nullable=False),
        sa.Column("total_nodes_skipped", sa.Integer(), nullable=False),
        sa.Column("total_distance_km", sa.Float(), nullable=False),
        sa.Column("fuel_saved_liters", sa.Float(), nullable=False),
        sa.Column("co2_saved_kg", sa.Float(), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_route_sessions_id"), "route_sessions", ["id"], unique=False)
    op.create_index(op.f("ix_route_sessions_session_date"), "route_sessions", ["session_date"], unique=False)

    op.create_table(
        "trucks",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("truck_id", sa.String(length=50), nullable=False),
        sa.Column("registration_number", sa.String(length=50), nullable=False),
        sa.Column("driver_name", sa.String(length=100), nullable=False),
        sa.Column("driver_phone", sa.String(length=20), nullable=False),
        sa.Column("capacity_kg", sa.Integer(), nullable=False),
        sa.Column("zone", sa.String(length=100), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_trucks_id"), "trucks", ["id"], unique=False)
    op.create_index(op.f("ix_trucks_truck_id"), "trucks", ["truck_id"], unique=True)
    op.create_unique_constraint("uq_trucks_registration_number", "trucks", ["registration_number"])

    op.create_table(
        "truck_assignments",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("route_session_id", sa.Integer(), nullable=False),
        sa.Column("truck_id", sa.String(length=50), nullable=False),
        sa.Column("driver_name", sa.String(length=100), nullable=True),
        sa.Column("total_distance_km", sa.Float(), nullable=False),
        sa.Column("total_waste_kg", sa.Float(), nullable=False),
        sa.Column("estimated_duration_hours", sa.Float(), nullable=False),
        sa.Column("stops_data", sa.JSON(), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["route_session_id"], ["route_sessions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_truck_assignments_id"), "truck_assignments", ["id"], unique=False)
    op.create_index(op.f("ix_truck_assignments_truck_id"), "truck_assignments", ["truck_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_truck_assignments_truck_id"), table_name="truck_assignments")
    op.drop_index(op.f("ix_truck_assignments_id"), table_name="truck_assignments")
    op.drop_table("truck_assignments")

    op.drop_constraint("uq_trucks_registration_number", "trucks", type_="unique")
    op.drop_index(op.f("ix_trucks_truck_id"), table_name="trucks")
    op.drop_index(op.f("ix_trucks_id"), table_name="trucks")
    op.drop_table("trucks")

    op.drop_index(op.f("ix_route_sessions_session_date"), table_name="route_sessions")
    op.drop_index(op.f("ix_route_sessions_id"), table_name="route_sessions")
    op.drop_table("route_sessions")

    op.drop_index(op.f("ix_waste_logs_timestamp"), table_name="waste_logs")
    op.drop_index(op.f("ix_waste_logs_node_id"), table_name="waste_logs")
    op.drop_index(op.f("ix_waste_logs_id"), table_name="waste_logs")
    op.drop_table("waste_logs")

    op.drop_index(op.f("ix_collection_nodes_zone"), table_name="collection_nodes")
    op.drop_index(op.f("ix_collection_nodes_node_id"), table_name="collection_nodes")
    op.drop_index(op.f("ix_collection_nodes_id"), table_name="collection_nodes")
    op.drop_table("collection_nodes")

    op.drop_index(op.f("ix_users_id"), table_name="users")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
