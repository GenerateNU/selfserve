package config

type S3 struct {
	AccessKeyID     string `env:"ACCESS_KEY_ID,required"`
	SecretAccessKey string `env:"SECRET_ACCESS_KEY,required"`
	Region          string `env:"REGION,required"`
	BucketName      string `env:"BUCKET_NAME,required"`
}
