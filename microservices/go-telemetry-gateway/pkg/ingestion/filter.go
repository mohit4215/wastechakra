package ingestion

import "github.com/mohit4215/wastechakra/telemetry/pkg/models"

func IsAnomalous(r models.SensorReading) bool {
	if r.FillLevelPct < 0.0 || r.FillLevelPct > 100.0 {
		return true
	}
	if r.TemperatureC < -10.0 || r.TemperatureC > 70.0 {
		return true
	}
	return false
}
