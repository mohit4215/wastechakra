use ecofleet_cvrp_solver::{CvrpSolver, Node, Vehicle};

#[test]
fn test_cvrp_capacity_bounds() {
    let depot = Node::new_depot("DEPOT", "Depot", 28.5, 77.2);
    let vehicles = vec![Vehicle::new("V1", 1000.0, "DL-01")];
    let customers = vec![
        Node { id: "C1".into(), name: "C1".into(), latitude: 28.51, longitude: 77.21, demand_kg: 600.0, is_depot: false, zone: "Z1".into() },
        Node { id: "C2".into(), name: "C2".into(), latitude: 28.52, longitude: 77.22, demand_kg: 600.0, is_depot: false, zone: "Z1".into() },
    ];

    let solver = CvrpSolver::new(depot, vehicles, customers);
    let sol = solver.solve();

    assert_eq!(sol.routes.len(), 1);
    assert!(sol.routes[0].total_load_kg <= 1000.0);
    assert_eq!(sol.unserviced_nodes.len(), 1);
}
