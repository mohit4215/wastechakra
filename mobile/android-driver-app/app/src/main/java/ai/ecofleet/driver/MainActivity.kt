package ai.ecofleet.driver

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import ai.ecofleet.driver.ui.RouteScreen
import ai.ecofleet.driver.viewmodel.DriverRouteViewModel

class MainActivity : ComponentActivity() {
    private val viewModel: DriverRouteViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        viewModel.loadManifest()
        setContent {
            MaterialTheme {
                val manifest by viewModel.manifest.collectAsState()
                RouteScreen(
                    manifest = manifest,
                    onCollectClick = { stopIdx -> viewModel.completeStop(stopIdx, 550.0) }
                )
            }
        }
    }
}
