package config

type Application struct {
	Port     string `env:"PORT" envDefault:"8080"`           // Application port, fallback to 8080
	LogLevel string `env:"LOG_LEVEL" envDefault:"info"`      // debug, info, warn, error
	Host     string `env:"HOST" envDefault:"localhost:8080"` // Public host used in Swagger UI
}
