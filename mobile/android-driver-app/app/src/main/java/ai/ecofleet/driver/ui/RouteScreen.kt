package ai.ecofleet.driver.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import ai.ecofleet.driver.model.DriverManifest
import ai.ecofleet.driver.ui.components.StopCard

@Composable
fun RouteScreen(
    manifest: DriverManifest?,
    onCollectClick: (Int) -> Unit
) {
    if (manifest == null) return

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Truck: ${manifest.truckId} • ${manifest.driverName}", style = MaterialTheme.typography.titleMedium)
        LinearProgressIndicator(
            progress = manifest.progressPercent / 100f,
            modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)
        )
        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(manifest.stops) { stop ->
                StopCard(stop = stop, onCollect = { onCollectClick(stop.stopIndex) })
            }
        }
    }
}
