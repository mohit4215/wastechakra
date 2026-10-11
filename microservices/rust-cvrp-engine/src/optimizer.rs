use crate::models::{Node, Route};

pub fn two_opt_optimize(route: &mut Route, depot: &Node) {
    if route.stops.len() < 4 {
        return;
    }
    let n = route.stops.len();
    let mut improved = true;

    while improved {
        improved = false;
        for i in 0..(n - 1) {
            for j in (i + 1)..n {
                let current_d = crate::distance::haversine_distance(&route.stops[i], &route.stops[i + 1])
                    + crate::distance::haversine_distance(&route.stops[j], if j + 1 < n { &route.stops[j + 1] } else { depot });
                let new_d = crate::distance::haversine_distance(&route.stops[i], &route.stops[j])
                    + crate::distance::haversine_distance(&route.stops[i + 1], if j + 1 < n { &route.stops[j + 1] } else { depot });

                if new_d < current_d - 0.001 {
                    route.stops[i + 1..=j].reverse();
                    improved = true;
                }
            }
        }
    }
}
