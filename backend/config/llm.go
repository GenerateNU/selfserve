package config

type LLM struct {
	ServerAddress   string  `env:"SERVER_ADDRESS" envDefault:"http://127.0.0.1:11434"`
	Model           string  `env:"MODEL" envDefault:"qwen2.5:7b-instruct"`
	Timeout         int     `env:"TIMEOUT" envDefault:"60"`
	MaxOutputTokens int     `env:"MAX_OUTPUT_TOKENS" envDefault:"1024"`
	Temperature     float64 `env:"TEMPERATURE" envDefault:"0.2"`
}
