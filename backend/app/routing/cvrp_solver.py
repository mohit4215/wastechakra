"""
CVRP Routing Engine
====================
Solves the Capacitated Vehicle Routing Problem (CVRP) using Google OR-Tools.

Given a list of waste-collection nodes with predicted volumes, this engine:
1. Builds a distance matrix (geodesic distances via geopy)
2. Applies vehicle capacity constraints
3. Skips low-risk nodes (< 30% fill) to reduce unnecessary trips
4. Returns optimised per-truck stop sequences

Reference: https://developers.google.com/optimization/routing/cvrp
"""
from __future__ import annotations

import logging
import math
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Geodesic distance helpers
# ---------------------------------------------------------------------------

_R_EARTH_KM = 6371.0


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Fast haversine formula for distance in km."""
    φ1, φ2 = math.radians(lat1), math.radians(lat2)
    dφ = math.radians(lat2 - lat1)
    dλ = math.radians(lon2 - lon1)
    a = math.sin(dφ / 2) ** 2 + math.cos(φ1) * math.cos(φ2) * math.sin(dλ / 2) ** 2
    return 2 * _R_EARTH_KM * math.asin(math.sqrt(a))


def _build_distance_matrix(locations: List[Tuple[float, float]]) -> List[List[int]]:
    """
    Build an integer distance matrix (in metres × 10 to preserve decimals)
    for OR-Tools which requires integer costs.
    """
    n = len(locations)
    matrix = [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if i != j:
                km = _haversine_km(*locations[i], *locations[j])
                matrix[i][j] = int(km * 1000)  # metres as integer
    return matrix


# ---------------------------------------------------------------------------
# OR-Tools CVRP solver
# ---------------------------------------------------------------------------

def _solve_with_ortools(
    nodes: List[dict],
    depot_lat: float,
    depot_lon: float,
    num_trucks: int,
    truck_capacity_kg: int,
) -> Optional[List[List[int]]]:
    """
    Run OR-Tools CVRP. Returns list-of-lists of node indices per truck.
    Returns None if OR-Tools is unavailable.
    """
    try:
        from ortools.constraint_solver import routing_enums_pb2
        from ortools.constraint_solver import pywrapcp
    except ImportError:
        logger.warning("OR-Tools not installed — using greedy fallback routing")
        return None

    # Locations: depot at index 0, then nodes
    locations = [(depot_lat, depot_lon)] + [(n["latitude"], n["longitude"]) for n in nodes]
    demands = [0] + [int(n.get("predicted_volume_kg", 0)) for n in nodes]

    dist_matrix = _build_distance_matrix(locations)

    manager = pywrapcp.RoutingIndexManager(len(locations), num_trucks, 0)
    routing = pywrapcp.RoutingModel(manager)

    def distance_callback(from_index, to_index):
        f = manager.IndexToNode(from_index)
        t = manager.IndexToNode(to_index)
        return dist_matrix[f][t]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    def demand_callback(from_index):
        node = manager.IndexToNode(from_index)
        return demands[node]

    demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
    routing.AddDimensionWithVehicleCapacity(
        demand_callback_index, 0, [truck_capacity_kg] * num_trucks, True, "Capacity"
    )

    params = pywrapcp.DefaultRoutingSearchParameters()
    params.first_solution_strategy = routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    params.local_search_metaheuristic = routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    params.time_limit.seconds = 10

    solution = routing.SolveWithParameters(params)
    if not solution:
        return None

    routes: List[List[int]] = []
    for vehicle_id in range(num_trucks):
        route = []
        index = routing.Start(vehicle_id)
        while not routing.IsEnd(index):
            node = manager.IndexToNode(index)
            if node != 0:           # exclude depot
                route.append(node - 1)  # shift back to 0-indexed nodes list
            index = solution.Value(routing.NextVar(index))
        if route:
            routes.append(route)
    return routes


# ---------------------------------------------------------------------------
# Greedy fallback: nearest-neighbour + capacity constraint
# ---------------------------------------------------------------------------

def _greedy_routes(
    nodes: List[dict],
    depot_lat: float,
    depot_lon: float,
    num_trucks: int,
    truck_capacity_kg: int,
) -> List[List[int]]:
    """Greedy nearest-neighbour assignment when OR-Tools is unavailable."""
    unvisited = set(range(len(nodes)))
    routes: List[List[int]] = [[] for _ in range(num_trucks)]
    loads = [0] * num_trucks

    for truck in range(num_trucks):
        cur_lat, cur_lon = depot_lat, depot_lon
        while unvisited:
            best_idx, best_dist = None, float("inf")
            for idx in unvisited:
                n = nodes[idx]
                demand = n.get("predicted_volume_kg", 0)
                if loads[truck] + demand > truck_capacity_kg:
                    continue
                d = _haversine_km(cur_lat, cur_lon, n["latitude"], n["longitude"])
                if d < best_dist:
                    best_dist = d
                    best_idx = idx
            if best_idx is None:
                break
            routes[truck].append(best_idx)
            loads[truck] += nodes[best_idx].get("predicted_volume_kg", 0)
            cur_lat = nodes[best_idx]["latitude"]
            cur_lon = nodes[best_idx]["longitude"]
            unvisited.remove(best_idx)

    return [r for r in routes if r]  # drop empty trucks


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

# Depot: MCD South Zone Depot, Okhla
DEFAULT_DEPOT = {"lat": 28.5355, "lon": 77.2510, "name": "MCD South Zone Depot, Okhla"}

DIESEL_L_PER_KM = 0.35          # avg diesel consumption l/km
CO2_KG_PER_LITRE = 2.68         # CO₂ emitted per litre of diesel

# Without optimisation, baseline distance per truck per day
BASELINE_DISTANCE_KM_PER_TRUCK = 80.0


def optimize_routes(
    forecasts: List[dict],
    num_trucks: int = 5,
    truck_capacity_kg: int = 5000,
    skip_low_risk: bool = True,
    depot: Optional[dict] = None,
) -> dict:
    """
    Main entry point for route optimisation.

    Parameters
    ----------
    forecasts       : list of forecast dicts (output of batch_forecast)
    num_trucks      : number of available trucks
    truck_capacity_kg : capacity per truck in kg
    skip_low_risk   : whether to skip nodes with fill < 30%
    depot           : dict with lat/lon/name of the depot

    Returns
    -------
    dict with route plans and savings metrics
    """
    depot = depot or DEFAULT_DEPOT
    depot_lat = depot["lat"]
    depot_lon = depot["lon"]
    depot_name = depot["name"]

    # -----------------------------------------------------------------------
    # 1. Filter nodes
    # -----------------------------------------------------------------------
    serviced = [f for f in forecasts if not skip_low_risk or f["fill_percentage"] >= 30.0]
    skipped = [f for f in forecasts if f not in serviced]

    if not serviced:
        logger.info("All nodes below threshold — no routes generated")
        return {
            "routes": [],
            "total_nodes_serviced": 0,
            "total_nodes_skipped": len(skipped),
            "total_distance_km": 0.0,
            "estimated_fuel_saved_liters": 0.0,
            "co2_saved_kg": 0.0,
        }

    # Sort by risk (critical first) so greedy prioritises overflow nodes
    risk_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    serviced.sort(key=lambda x: risk_order.get(x["risk_level"], 4))

    # -----------------------------------------------------------------------
    # 2. Solve CVRP
    # -----------------------------------------------------------------------
    node_routes = _solve_with_ortools(
        serviced, depot_lat, depot_lon, num_trucks, truck_capacity_kg
    )
    if node_routes is None:
        node_routes = _greedy_routes(
            serviced, depot_lat, depot_lon, num_trucks, truck_capacity_kg
        )

    # -----------------------------------------------------------------------
    # 3. Build response
    # -----------------------------------------------------------------------
    routes_out = []
    total_distance = 0.0

    for truck_idx, stop_indices in enumerate(node_routes):
        truck_id = f"TRUCK-{truck_idx + 1:02d}"
        stops = []
        cum_dist = 0.0
        cur_lat, cur_lon = depot_lat, depot_lon
        total_waste = 0.0

        for stop_num, node_idx in enumerate(stop_indices):
            node = serviced[node_idx]
            dist = _haversine_km(cur_lat, cur_lon, node["latitude"], node["longitude"])
            cum_dist += dist
            total_waste += node.get("predicted_volume_kg", 0)
            cur_lat, cur_lon = node["latitude"], node["longitude"]
            stops.append({
                "stop_index": stop_num + 1,
                "node_id": node["node_id"],
                "node_name": node["node_name"],
                "latitude": node["latitude"],
                "longitude": node["longitude"],
                "predicted_volume_kg": node["predicted_volume_kg"],
                "risk_level": node["risk_level"],
            })

        # Return to depot
        cum_dist += _haversine_km(cur_lat, cur_lon, depot_lat, depot_lon)
        total_distance += cum_dist

        routes_out.append({
            "truck_id": truck_id,
            "total_distance_km": round(cum_dist, 2),
            "total_waste_kg": round(total_waste, 1),
            "estimated_duration_hours": round(cum_dist / 30.0, 2),  # avg 30 km/h in city
            "stops": stops,
            "start_depot": depot_name,
            "end_depot": depot_name,
        })

    # -----------------------------------------------------------------------
    # 4. Savings metrics
    # -----------------------------------------------------------------------
    baseline_distance = BASELINE_DISTANCE_KM_PER_TRUCK * num_trucks
    saved_km = max(baseline_distance - total_distance, 0)
    fuel_saved = round(saved_km * DIESEL_L_PER_KM, 2)
    co2_saved = round(fuel_saved * CO2_KG_PER_LITRE, 2)

    return {
        "routes": routes_out,
        "total_nodes_serviced": len(serviced),
        "total_nodes_skipped": len(skipped),
        "total_distance_km": round(total_distance, 2),
        "estimated_fuel_saved_liters": fuel_saved,
        "co2_saved_kg": co2_saved,
    }
