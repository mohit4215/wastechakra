package models

import "time"

type SensorReading struct {
	DeviceID      string    `json:"device_id"`
	NodeID        string    `json:"node_id"`
	FillLevelPct  float64   `json:"fill_level_pct"`
	BatteryPct    float64   `json:"battery_pct"`
	TemperatureC  float64   `json:"temperature_c"`
	TiltDegrees   float64   `json:"tilt_degrees"`
	LidOpen       bool      `json:"lid_open"`
	Timestamp     time.Time `json:"timestamp"`
}
