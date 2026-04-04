package s3

import (
	"context"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsConfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/generate/selfserve/config"
	"github.com/generate/selfserve/internal/httpx"
	"github.com/generate/selfserve/internal/models"
)

type Storage struct {
	Client     *s3.Client
	BucketName string
	URL        *s3.PresignClient
}

func NewS3Storage(cfg config.S3) (*Storage, error) {
	awsCfg, err := awsConfig.LoadDefaultConfig(context.Background(),
		awsConfig.WithRegion(cfg.Region),
		awsConfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			cfg.AccessKeyID,
			cfg.SecretAccessKey,
			"",
		)),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create AWS config: %w", err)
	}

	client := s3.NewFromConfig(awsCfg)
	return &Storage{
		Client:     client,
		BucketName: cfg.BucketName,
		URL:        s3.NewPresignClient(client),
	}, nil
}

func (s *Storage) GeneratePresignedUploadURL(ctx context.Context, in models.PresignedURLInput) (string, error) {
	if err := httpx.Validate(&in); err != nil {
		return "", err
	}

	presignedURL, err := s.URL.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket: aws.String(s.BucketName),
		Key:    aws.String(in.Key),
	}, func(opts *s3.PresignOptions) {
		opts.Expires = in.Expiration
	})
	if err != nil {
		return "", fmt.Errorf("failed to generate presigned URL with key %s: %w", in.Key, err)
	}
	return presignedURL.URL, nil
}

func (s *Storage) GeneratePresignedGetURL(ctx context.Context, in models.PresignedURLInput) (string, error) {
	if err := httpx.Validate(&in); err != nil {
		return "", err
	}

	presignedURL, err := s.URL.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.BucketName),
		Key:    aws.String(in.Key),
	}, func(opts *s3.PresignOptions) {
		opts.Expires = in.Expiration
	})
	if err != nil {
		return "", fmt.Errorf("failed to generate presigned get URL with key %s: %w", in.Key, err)
	}
	return presignedURL.URL, nil
}

func (s *Storage) DeleteFile(ctx context.Context, key string) error {
	if key == "" {
		return fmt.Errorf("key is required")
	}

	_, err := s.Client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.BucketName),
		Key:    aws.String(key),
	})
	if err != nil {
		return fmt.Errorf("failed to delete file with key %s: %w", key, err)
	}
	return nil
}
