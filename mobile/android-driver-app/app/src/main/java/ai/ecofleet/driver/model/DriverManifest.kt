package ai.ecofleet.driver.model

data class DriverManifest(
    val truckId: String,
    val driverName: String,
    val routeDate: String,
    val totalDistanceKm: Double,
    val capacityKg: Double,
    val currentWasteKg: Double,
    val stops: List<RouteStop>
) {
    val progressPercent: Int
        get() = if (stops.isEmpty()) 0 else (stops.count { it.isCollected } * 100) / stops.size
}
