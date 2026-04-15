package config

type LLM struct {
	APIKey          string  `env:"API_KEY"`
	Model           string  `env:"MODEL" envDefault:"gemini-3-flash-preview"`
	MaxOutputTokens int     `env:"MAX_OUTPUT_TOKENS" envDefault:"1024"`
	Temperature     float64 `env:"TEMPERATURE" envDefault:"0.2"`
}
