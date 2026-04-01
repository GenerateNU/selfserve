package config

type OpenSearch struct {
	URL             string `env:"URL,required"`
	Username        string `env:"USERNAME,default=admin"`
	Password        string `env:"PASSWORD,required"`
	InsecureSkipTLS bool   `env:"INSECURE_SKIP_TLS,default=false"`
}
