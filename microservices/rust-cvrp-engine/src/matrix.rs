use crate::distance::haversine_distance;
use crate::models::Node;

pub struct DistanceMatrix {
    pub matrix: Vec<Vec<f64>>,
}

impl DistanceMatrix {
    pub fn build(nodes: &[Node]) -> Self {
        let n = nodes.len();
        let mut matrix = vec![vec![0.0; n]; n];
        for i in 0..n {
            for j in 0..n {
                if i != j {
                    matrix[i][j] = haversine_distance(&nodes[i], &nodes[j]);
                }
            }
        }
        Self { matrix }
    }

    pub fn get(&self, i: usize, j: usize) -> f64 {
        self.matrix[i][j]
    }
}
