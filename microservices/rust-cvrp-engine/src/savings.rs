use crate::distance::haversine_distance;
use crate::models::Node;

#[derive(Debug, Clone)]
pub struct ClarkeWrightSaving {
    pub from_idx: usize,
    pub to_idx: usize,
    pub saving_km: f64,
}

pub fn calculate_savings(depot: &Node, customers: &[Node]) -> Vec<ClarkeWrightSaving> {
    let mut savings = Vec::new();
    let n = customers.len();

    for i in 0..n {
        let d_i_depot = haversine_distance(&customers[i], depot);
        for j in (i + 1)..n {
            let d_j_depot = haversine_distance(&customers[j], depot);
            let d_i_j = haversine_distance(&customers[i], &customers[j]);
            let s = d_i_depot + d_j_depot - d_i_j;
            if s > 0.0 {
                savings.push(ClarkeWrightSaving {
                    from_idx: i,
                    to_idx: j,
                    saving_km: s,
                });
            }
        }
    }

    savings.sort_by(|a, b| b.saving_km.partial_cmp(&a.saving_km).unwrap());
    savings
}
