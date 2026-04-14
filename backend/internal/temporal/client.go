package temporal

import (
	"crypto/tls"

	"github.com/generate/selfserve/config"
	"go.temporal.io/sdk/client"
)

func NewClient(cfg config.Temporal) (client.Client, error) {
	return client.Dial(client.Options{
		HostPort:    cfg.HostPort,
		Namespace:   cfg.Namespace,
		Credentials: client.NewAPIKeyStaticCredentials(cfg.APIKey),
		ConnectionOptions: client.ConnectionOptions{
			TLS: &tls.Config{},
		},
	})
}
