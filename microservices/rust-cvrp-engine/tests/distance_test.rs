use ecofleet_cvrp_solver::distance::haversine_distance;
use ecofleet_cvrp_solver::models::Node;

#[test]
fn test_haversine_symmetric() {
    let n1 = Node::new_depot("N1", "Node 1", 28.5, 77.2);
    let n2 = Node::new_depot("N2", "Node 2", 28.6, 77.3);

    let d1 = haversine_distance(&n1, &n2);
    let d2 = haversine_distance(&n2, &n1);

    assert!((d1 - d2).abs() < 1e-6);
    assert!(d1 > 10.0 && d1 < 25.0);
}
