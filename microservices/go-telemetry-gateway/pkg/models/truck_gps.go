package models

import "time"

type TruckGPS struct {
	TruckID     string    `json:"truck_id"`
	Latitude    float64   `json:"latitude"`
	Longitude   float64   `json:"longitude"`
	SpeedKmH    float64   `json:"speed_kmh"`
	HeadingDeg  float64   `json:"heading_deg"`
	CurrentFuel float64   `json:"current_fuel_pct"`
	RecordedAt  time.Time `json:"recorded_at"`
}
