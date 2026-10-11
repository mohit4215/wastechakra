package ingestion

import (
	"context"
	"testing"
	"time"
	"github.com/mohit4215/wastechakra/telemetry/pkg/models"
)

func TestOverflowAlertTriggered(t *testing.T) {
	q := NewIngestionQueue(10)
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go q.StartWorker(ctx, 1)

	q.SensorChan <- models.SensorReading{
		NodeID:       "NODE-001",
		FillLevelPct: 95.0,
		Timestamp:    time.Now(),
	}

	select {
	case alert := <-q.AlertsChan:
		if alert.NodeID != "NODE-001" || alert.Severity != "CRITICAL" {
			t.Errorf("Unexpected alert data: %+v", alert)
		}
	case <-time.After(1 * time.Second):
		t.Error("Timed out waiting for overflow alert")
	}
}
