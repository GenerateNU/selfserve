package config 

type Clerk struct {
	BaseURL           string `env:"BASE_URL" envDefault:"https://api.clerk.com/v1"`
	SecretKey         string `env:"SECRET_KEY,required"`
	WebhookSignature  string `env:"WEBHOOK_SIGNATURE,required"`
}