package models

import "time"

type OverflowAlert struct {
	AlertID   string    `json:"alert_id"`
	NodeID    string    `json:"node_id"`
	FillLevel float64   `json:"fill_level_pct"`
	Severity  string    `json:"severity"`
	CreatedAt time.Time `json:"created_at"`
}
