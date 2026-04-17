package config

type Config struct {
	Application `env:",prefix=APP_"`
	DB          `env:",prefix=DB_"`
	S3          `env:",prefix=AWS_S3_"`
	LLM         `env:",prefix=LLM_"`
	Temporal    `env:",prefix=TEMPORAL_"`
	Clerk       `env:",prefix=CLERK_"`
	Redis       `env:",prefix=REDIS_"`
	OpenSearch  `env:",prefix=OPENSEARCH_"`
}
