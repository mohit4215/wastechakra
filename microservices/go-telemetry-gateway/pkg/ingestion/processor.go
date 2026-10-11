package ingestion

import (
	"context"
	"fmt"
	"time"
	"github.com/mohit4215/wastechakra/telemetry/pkg/models"
)

func (q *IngestionQueue) StartWorker(ctx context.Context, id int) {
	for {
		select {
		case <-ctx.Done():
			return
		case reading := <-q.SensorChan:
			if reading.FillLevelPct >= 90.0 {
				q.AlertsChan <- models.OverflowAlert{
					AlertID:   fmt.Sprintf("ALT-%d", time.Now().UnixNano()),
					NodeID:    reading.NodeID,
					FillLevel: reading.FillLevelPct,
					Severity:  "CRITICAL",
					CreatedAt: time.Now(),
				}
			}
		}
	}
}
