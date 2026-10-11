use serde::{Deserialize, Serialize};
use super::node::Node;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Route {
    pub vehicle_id: String,
    pub stops: Vec<Node>,
    pub total_distance_km: f64,
    pub total_load_kg: f64,
    pub estimated_duration_mins: u32,
}
