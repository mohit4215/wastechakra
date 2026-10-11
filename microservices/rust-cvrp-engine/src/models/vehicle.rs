use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Vehicle {
    pub id: String,
    pub capacity_kg: f64,
    pub current_load_kg: f64,
    pub registration_no: String,
}

impl Vehicle {
    pub fn new(id: &str, capacity_kg: f64, reg: &str) -> Self {
        Self {
            id: id.to_string(),
            capacity_kg,
            current_load_kg: 0.0,
            registration_no: reg.to_string(),
        }
    }

    pub fn can_accommodate(&self, demand_kg: f64) -> bool {
        self.current_load_kg + demand_kg <= self.capacity_kg
    }
}
