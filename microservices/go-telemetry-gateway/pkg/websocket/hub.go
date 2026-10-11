package websocket

import "sync"

type Hub struct {
	clients    map[string]bool
	broadcast  chan []byte
	register   chan string
	unregister chan string
	mu         sync.Mutex
}

func NewHub() *Hub {
	return &Hub{
		broadcast:  make(chan []byte, 256),
		register:   make(chan string),
		unregister: make(chan string),
		clients:    make(map[string]bool),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case id := <-h.register:
			h.mu.Lock()
			h.clients[id] = true
			h.mu.Unlock()
		case id := <-h.unregister:
			h.mu.Lock()
			delete(h.clients, id)
			h.mu.Unlock()
		case msg := <-h.broadcast:
			_ = msg
		}
	}
}
