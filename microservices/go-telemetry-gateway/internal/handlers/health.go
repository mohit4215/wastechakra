package handlers

import (
	"encoding/json"
	"net/http"
	"time"
	"github.com/mohit4215/wastechakra/telemetry/pkg/models"
)

var startTime = time.Now()

func HealthHandler(w http.ResponseWriter, r *http.Request) {
	h := models.ServiceHealth{
		Status:    "healthy",
		Service:   "ecofleet-telemetry-gateway",
		UptimeSec: int64(time.Since(startTime).Seconds()),
		Version:   "1.0.0",
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(h)
}
