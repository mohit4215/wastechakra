package ai.ecofleet.driver.model

data class RouteStop(
    val stopIndex: Int,
    val nodeId: String,
    val nodeName: String,
    val latitude: Double,
    val longitude: Double,
    val predictedVolumeKg: Double,
    val riskLevel: RiskLevel,
    var isCollected: Boolean = false,
    var collectedKg: Double? = null
)
