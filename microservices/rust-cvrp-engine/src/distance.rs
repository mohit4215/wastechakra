use crate::models::Node;

const EARTH_RADIUS_KM: f64 = 6371.0;

pub fn haversine_distance(a: &Node, b: &Node) -> f64 {
    let lat1 = a.latitude.to_radians();
    let lon1 = a.longitude.to_radians();
    let lat2 = b.latitude.to_radians();
    let lon2 = b.longitude.to_radians();

    let dlat = lat2 - lat1;
    let dlon = lon2 - lon1;

    let sin_dlat2 = (dlat / 2.0).sin();
    let sin_dlon2 = (dlon / 2.0).sin();

    let h = sin_dlat2 * sin_dlat2 + lat1.cos() * lat2.cos() * sin_dlon2 * sin_dlon2;
    let c = 2.0 * h.sqrt().asin();

    EARTH_RADIUS_KM * c
}
