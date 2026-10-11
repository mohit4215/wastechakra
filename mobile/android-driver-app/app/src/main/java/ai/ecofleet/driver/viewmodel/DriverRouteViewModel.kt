package ai.ecofleet.driver.viewmodel

import androidx.lifecycle.ViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import ai.ecofleet.driver.model.DriverManifest
import ai.ecofleet.driver.repository.RouteRepository

class DriverRouteViewModel(
    private val repo: RouteRepository = RouteRepository()
) : ViewModel() {
    private val _manifest = MutableStateFlow<DriverManifest?>(null)
    val manifest: StateFlow<DriverManifest?> = _manifest.asStateFlow()

    fun loadManifest() {
        _manifest.value = repo.fetchAssignedManifest()
    }

    fun completeStop(stopIndex: Int, kg: Double) {
        val current = _manifest.value ?: return
        val updated = current.stops.map {
            if (it.stopIndex == stopIndex) it.copy(isCollected = true, collectedKg = kg) else it
        }
        _manifest.value = current.copy(stops = updated)
    }
}
