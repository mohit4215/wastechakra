use serde::{Deserialize, Serialize};
use super::{node::Node, route::Route};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Solution {
    pub routes: Vec<Route>,
    pub total_distance_km: f64,
    pub fuel_saved_liters: f64,
    pub co2_saved_kg: f64,
    pub unserviced_nodes: Vec<Node>,
}
