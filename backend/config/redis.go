package config

type Redis struct {
	Addr     string `env:"ADDR, default=localhost:6379"`
	Password string `env:"PASSWORD"`
}
