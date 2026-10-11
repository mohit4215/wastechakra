package ingestion

import (
	"sync"
	"github.com/mohit4215/wastechakra/telemetry/pkg/models"
)

type IngestionQueue struct {
	SensorChan chan models.SensorReading
	GPSChan    chan models.TruckGPS
	AlertsChan chan models.OverflowAlert
	mu         sync.RWMutex
}

func NewIngestionQueue(capacity int) *IngestionQueue {
	return &IngestionQueue{
		SensorChan: make(chan models.SensorReading, capacity),
		GPSChan:    make(chan models.TruckGPS, capacity),
		AlertsChan: make(chan models.OverflowAlert, capacity/2),
	}
}
