package storage

import (
	"sync"
	"github.com/mohit4215/wastechakra/telemetry/pkg/models"
)

type MemoryStore struct {
	readings map[string]models.SensorReading
	mu       sync.RWMutex
}

func NewMemoryStore() *MemoryStore {
	return &MemoryStore{readings: make(map[string]models.SensorReading)}
}

func (s *MemoryStore) Save(r models.SensorReading) {
	s.mu.Lock()
	s.readings[r.NodeID] = r
	s.mu.Unlock()
}

func (s *MemoryStore) Get(nodeID string) (models.SensorReading, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	r, exists := s.readings[nodeID]
	return r, exists
}
