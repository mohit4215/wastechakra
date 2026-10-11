package websocket

type Client struct {
	ID  string
	Hub *Hub
}

func NewClient(id string, hub *Hub) *Client {
	return &Client{ID: id, Hub: hub}
}
