package ai.ecofleet.driver.repository

import ai.ecofleet.driver.model.DriverManifest
import ai.ecofleet.driver.model.RiskLevel
import ai.ecofleet.driver.model.RouteStop

class RouteRepository {
    fun fetchAssignedManifest(): DriverManifest {
        val stops = listOf(
            RouteStop(1, "NODE-001", "Lajpat Nagar Central", 28.5700, 77.2400, 850.0, RiskLevel.CRITICAL),
            RouteStop(2, "NODE-002", "Defence Colony Market", 28.5730, 77.2310, 620.0, RiskLevel.HIGH),
            RouteStop(3, "NODE-003", "South Extension Part II", 28.5680, 77.2210, 480.0, RiskLevel.MEDIUM)
        )
        return DriverManifest("TRUCK-01", "Ramesh Kumar", "2026-10-12", 18.4, 5000.0, 1950.0, stops)
    }
}
