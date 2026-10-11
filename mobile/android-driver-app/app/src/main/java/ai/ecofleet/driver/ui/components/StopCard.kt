package ai.ecofleet.driver.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import ai.ecofleet.driver.model.RouteStop

@Composable
fun StopCard(stop: RouteStop, onCollect: () -> Unit) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.padding(12.dp).fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Text(text = "Stop #${stop.stopIndex}: ${stop.nodeName}", style = MaterialTheme.typography.titleSmall)
                Text(text = "Predicted: ${stop.predictedVolumeKg} kg • Risk: ${stop.riskLevel}")
            }
            if (stop.isCollected) {
                Text(text = "✓ Cleared", color = MaterialTheme.colorScheme.primary)
            } else {
                Button(onClick = onCollect) { Text("Collect") }
            }
        }
    }
}
