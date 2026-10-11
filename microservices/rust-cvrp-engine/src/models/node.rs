use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Node {
    pub id: String,
    pub name: String,
    pub latitude: f64,
    pub longitude: f64,
    pub demand_kg: f64,
    pub is_depot: bool,
    pub zone: String,
}

impl Node {
    pub fn new_depot(id: &str, name: &str, lat: f64, lon: f64) -> Self {
        Self {
            id: id.to_string(),
            name: name.to_string(),
            latitude: lat,
            longitude: lon,
            demand_kg: 0.0,
            is_depot: true,
            zone: "Depot".to_string(),
        }
    }
}
