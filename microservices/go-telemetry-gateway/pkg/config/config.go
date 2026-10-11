package config

type Config struct {
	Port         string
	BufferSize   int
	WorkerCount  int
	EnableWS     bool
}

func LoadDefault() *Config {
	return &Config{
		Port:        ":8080",
		BufferSize:  10000,
		WorkerCount: 4,
		EnableWS:    true,
	}
}
