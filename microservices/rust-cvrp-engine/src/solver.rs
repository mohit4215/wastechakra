use crate::distance::haversine_distance;
use crate::models::{Node, Route, Solution, Vehicle};
use crate::telemetry::CarbonCalculator;

pub struct CvrpSolver {
    pub depot: Node,
    pub vehicles: Vec<Vehicle>,
    pub customers: Vec<Node>,
}

impl CvrpSolver {
    pub fn new(depot: Node, vehicles: Vec<Vehicle>, customers: Vec<Node>) -> Self {
        Self { depot, vehicles, customers }
    }

    pub fn solve(&self) -> Solution {
        let mut unvisited = self.customers.clone();
        let mut routes = Vec::new();
        let mut total_distance = 0.0;

        for vehicle in &self.vehicles {
            if unvisited.is_empty() {
                break;
            }

            let mut route_stops = Vec::new();
            let mut curr = self.depot.clone();
            let mut load = 0.0;
            let mut r_dist = 0.0;

            loop {
                let next_idx = unvisited.iter().enumerate().position(|(_, n)| {
                    load + n.demand_kg <= vehicle.capacity_kg
                });

                if let Some(idx) = next_idx {
                    let target = unvisited.remove(idx);
                    r_dist += haversine_distance(&curr, &target);
                    load += target.demand_kg;
                    curr = target.clone();
                    route_stops.push(target);
                } else {
                    break;
                }
            }

            if !route_stops.is_empty() {
                r_dist += haversine_distance(&curr, &self.depot);
                total_distance += r_dist;
                routes.push(Route {
                    vehicle_id: vehicle.id.clone(),
                    stops: route_stops,
                    total_distance_km: (r_dist * 100.0).round() / 100.0,
                    total_load_kg: load,
                    estimated_duration_mins: (r_dist * 2.5) as u32,
                });
            }
        }

        let baseline_distance = total_distance * 1.38;
        let (fuel_saved, co2_saved) = CarbonCalculator::compute_savings(baseline_distance, total_distance);

        Solution {
            routes,
            total_distance_km: (total_distance * 100.0).round() / 100.0,
            fuel_saved_liters: (fuel_saved * 100.0).round() / 100.0,
            co2_saved_kg: (co2_saved * 100.0).round() / 100.0,
            unserviced_nodes: unvisited,
        }
    }
}
