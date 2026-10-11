use crate::models::{Solution, Vehicle};

pub fn validate_solution(solution: &Solution, vehicles: &[Vehicle]) -> bool {
    let vehicle_map: std::collections::HashMap<_, _> = vehicles.iter().map(|v| (&v.id, v.capacity_kg)).collect();

    for route in &solution.routes {
        if let Some(&cap) = vehicle_map.get(&route.vehicle_id) {
            if route.total_load_kg > cap {
                return false;
            }
        }
    }
    true
}
