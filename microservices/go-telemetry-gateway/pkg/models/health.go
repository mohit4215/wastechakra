package models

type ServiceHealth struct {
	Status    string `json:"status"`
	Service   string `json:"service"`
	UptimeSec int64  `json:"uptime_sec"`
	Version   string `json:"version"`
}
