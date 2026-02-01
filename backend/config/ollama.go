package config

type Ollama struct {
	ServerAddress string `env:"SERVER_ADDRESS" envDefault:"http://127.0.0.1:11434"`
	Model         string `env:"MODEL" envDefault:"llama3.2"`
	Timeout       int    `env:"TIMEOUT" envDefault:"60"`
}
