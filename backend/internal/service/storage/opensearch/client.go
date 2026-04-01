package opensearchstorage

import (
	"bytes"
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/generate/selfserve/config"
	opensearch "github.com/opensearch-project/opensearch-go/v2"
	"github.com/opensearch-project/opensearch-go/v2/opensearchapi"
)

func NewClient(cfg config.OpenSearch) (*opensearch.Client, error) {
	transport := &http.Transport{}
	if cfg.InsecureSkipTLS {
		transport.TLSClientConfig = &tls.Config{InsecureSkipVerify: true} //nolint:gosec // dev-only, controlled by config
	}

	client, err := opensearch.NewClient(opensearch.Config{
		Transport: transport,
		Addresses: []string{cfg.URL},
		Username:  cfg.Username,
		Password:  cfg.Password,
	})
	if err != nil {
		return nil, fmt.Errorf("creating opensearch client: %w", err)
	}
	return client, nil
}

// guestsIndexMapping defines the index schema. Fields are denormalized from
// guests + guest_bookings + rooms so all filtering can happen in one query.
var guestsIndexMapping = map[string]interface{}{
	"mappings": map[string]interface{}{
		"properties": map[string]interface{}{
			"id":       map[string]string{"type": "keyword"},
			"hotel_id": map[string]string{"type": "keyword"},
			"full_name": map[string]interface{}{
				"type": "text",
				"fields": map[string]interface{}{
					"keyword": map[string]string{"type": "keyword"},
				},
			},
			"first_name": map[string]interface{}{
				"type": "text",
				"fields": map[string]interface{}{
					"keyword": map[string]string{"type": "keyword"},
				},
			},
			"last_name": map[string]interface{}{
				"type": "text",
				"fields": map[string]interface{}{
					"keyword": map[string]string{"type": "keyword"},
				},
			},
			"preferred_name": map[string]interface{}{"type": "text"},
			"email":          map[string]interface{}{"type": "text"},
			"phone":          map[string]string{"type": "keyword"},
			"preferences":    map[string]interface{}{"type": "text"},
			"notes":          map[string]interface{}{"type": "text"},
			"floor":          map[string]string{"type": "integer"},
			"room_number":    map[string]string{"type": "integer"},
			"group_size":     map[string]string{"type": "integer"},
			"booking_status": map[string]string{"type": "keyword"},
			"arrival_date":   map[string]interface{}{"type": "date", "format": "strict_date_optional_time"},
			"departure_date": map[string]interface{}{"type": "date", "format": "strict_date_optional_time"},
		},
	},
}

// EnsureGuestsIndex creates the guests index with its mapping if it doesn't already exist.
func EnsureGuestsIndex(ctx context.Context, client *opensearch.Client) error {
	res, err := opensearchapi.IndicesExistsRequest{Index: []string{GuestsIndex}}.Do(ctx, client)
	if err != nil {
		return fmt.Errorf("checking guests index: %w", err)
	}
	defer res.Body.Close()

	if res.StatusCode == http.StatusOK {
		return nil
	}

	body, err := json.Marshal(guestsIndexMapping)
	if err != nil {
		return err
	}

	createRes, err := opensearchapi.IndicesCreateRequest{
		Index: GuestsIndex,
		Body:  bytes.NewReader(body),
	}.Do(ctx, client)
	if err != nil {
		return fmt.Errorf("creating guests index: %w", err)
	}
	defer createRes.Body.Close()

	if createRes.IsError() {
		return fmt.Errorf("guests index creation failed: %s", createRes.String())
	}
	return nil
}
