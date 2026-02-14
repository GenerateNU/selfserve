package s3

import (
	"context"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsConfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/generate/selfserve/config"
)

type Storage struct {
	Client     *s3.Client
	BucketName string
	URL        *s3.PresignClient
}

func NewS3Storage(cfg config.S3) (*Storage, error) {
	// Create AWS config with your credentials
	awsCfg, err := awsConfig.LoadDefaultConfig(context.Background(),
		awsConfig.WithRegion(cfg.Region),
		awsConfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			cfg.AccessKeyID,
			cfg.SecretAccessKey,
			"",
		)),
	)
	if err != nil {
		return nil, err
	}

	// Create S3 client
	client := s3.NewFromConfig(awsCfg)

	return &Storage{
		Client:     client,
		BucketName: cfg.BucketName,
		URL:        s3.NewPresignClient(client),
	}, nil
}

func (s *Storage) GeneratePresignedURL(ctx context.Context, key string, expiration time.Duration) (string, error) {

	presignedURL, err := s.URL.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket: aws.String(s.BucketName),
		Key:    aws.String(key),
	}, func(opts *s3.PresignOptions) {
		opts.Expires = expiration
	},
)

	if err != nil {
		return "", err
	}

	return presignedURL.URL, nil
}

func (s *Storage) GeneratePresignedGetURL(ctx context.Context, key string, expiration time.Duration) (string, error) {
	presignedURL, err := s.URL.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.BucketName),
		Key:    aws.String(key),
	}, func(opts *s3.PresignOptions) { opts.Expires = expiration },
)
	if err != nil {
		return "", err
	}
	return presignedURL.URL, nil
}


func (s *Storage) DeleteFile(ctx context.Context, key string) (error) {
	_, err := s.Client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.BucketName),
		Key:    aws.String(key),
	})
	if err != nil {
		return err
	}

	return nil
}


