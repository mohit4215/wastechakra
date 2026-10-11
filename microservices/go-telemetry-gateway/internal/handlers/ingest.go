package handlers

import (
	"encoding/json"
	"net/http"
	"github.com/mohit4215/wastechakra/telemetry/pkg/ingestion"
	"github.com/mohit4215/wastechakra/telemetry/pkg/models"
)

func IngestSensorHandler(queue *ingestion.IngestionQueue) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		var reading models.SensorReading
		if err := json.NewDecoder(r.Body).Decode(&reading); err != nil {
			http.Error(w, "Invalid payload", http.StatusBadRequest)
			return
		}
		queue.SensorChan <- reading
		w.WriteHeader(http.StatusAccepted)
	}
}
