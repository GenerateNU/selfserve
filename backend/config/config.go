package config

type Config struct {
	Application `env:",prefix=APP_"`
	DB          `env:",prefix=DB_"`
}
