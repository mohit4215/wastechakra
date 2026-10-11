package metrics

import "sync/atomic"

type MetricsCollector struct {
	ReadingsIngested uint64
	AlertsTriggered  uint64
	GPSPingsIngested uint64
}

func (m *MetricsCollector) RecordReading() {
	atomic.AddUint64(&m.ReadingsIngested, 1)
}

func (m *MetricsCollector) RecordAlert() {
	atomic.AddUint64(&m.AlertsTriggered, 1)
}

func (m *MetricsCollector) RecordGPS() {
	atomic.AddUint64(&m.GPSPingsIngested, 1)
}
