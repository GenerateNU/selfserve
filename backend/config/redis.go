package config

import "time"

type Redis struct {
	Enabled     bool          `env:"ENABLED,default=false"`
	Addr        string        `env:"ADDR,default=localhost:6379"`
	Password    string        `env:"PASSWORD"`
	DB          int           `env:"DB,default=0"`
	PingTimeout time.Duration `env:"PING_TIMEOUT,default=1s"`
}
