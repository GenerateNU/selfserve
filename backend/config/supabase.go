package config

type Supabase struct {
	URL       string `env:"SUPABASE_URL, required"`
	Key       string `env:"SUPABASE_ANON_KEY, required"`
	JWTSecret string `env:"SUPABASE_JWT_SECRET, required"`
	ProjectID string `env:"SUPABASE_PROJECT_ID, required"`
}
