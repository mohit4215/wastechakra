use ecofleet_cvrp_solver::{CvrpSolver, Node, Vehicle};

fn main() {
    println!("EcoFleet Native Rust CVRP Solver Engine v0.1.0");
    let depot = Node::new_depot("DEPOT-01", "Okhla Central Transfer Depot", 28.5355, 77.2732);
    let vehicles = vec![
        Vehicle::new("TRUCK-01", 5000.0, "DL-1C-0001"),
        Vehicle::new("TRUCK-02", 5000.0, "DL-1C-0002"),
    ];

    let customers = vec![
        Node { id: "N-1".into(), name: "Lajpat Nagar".into(), latitude: 28.5700, longitude: 77.2400, demand_kg: 850.0, is_depot: false, zone: "South".into() },
        Node { id: "N-2".into(), name: "Saket Mall".into(), latitude: 28.5280, longitude: 77.2180, demand_kg: 1200.0, is_depot: false, zone: "South".into() },
    ];

    let solver = CvrpSolver::new(depot, vehicles, customers);
    let sol = solver.solve();
    println!("Routes generated: {}", sol.routes.len());
    println!("Total distance: {} km", sol.total_distance_km);
    println!("CO2 saved: {} kg", sol.co2_saved_kg);
}
