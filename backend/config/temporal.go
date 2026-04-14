package config

type Temporal struct {
	HostPort  string `env:"HOST_PORT,required"`
	Namespace string `env:"NAMESPACE,required"`
	APIKey    string `env:"API_KEY,required"`
}
