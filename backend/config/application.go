package config

type Application struct {
	Port     string `env:"APP_PORT" envDefault:"8080"`      // Application port, fallback to 8080
	LogLevel string `env:"APP_LOG_LEVEL" envDefault:"info"` // debug, info, warn, error
}
