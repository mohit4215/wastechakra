package main

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/mohit4215/wastechakra/telemetry/internal/handlers"
	"github.com/mohit4215/wastechakra/telemetry/pkg/config"
	"github.com/mohit4215/wastechakra/telemetry/pkg/ingestion"
)

func main() {
	cfg := config.LoadDefault()
	fmt.Println("EcoFleet IoT Telemetry Gateway starting on port", cfg.Port)

	queue := ingestion.NewIngestionQueue(cfg.BufferSize)
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	for i := 0; i < cfg.WorkerCount; i++ {
		go queue.StartWorker(ctx, i)
	}

	http.HandleFunc("/healthz", handlers.HealthHandler)
	http.HandleFunc("/api/telemetry/sensor", handlers.IngestSensorHandler(queue))

	server := &http.Server{
		Addr:         cfg.Port,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
	}
	_ = server
}
