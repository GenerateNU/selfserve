package repository

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"

	"github.com/generate/selfserve/internal/models"
	opensearch "github.com/opensearch-project/opensearch-go/v2"
	"github.com/opensearch-project/opensearch-go/v2/opensearchapi"
)

const guestsIndex = "guests"

type OpenSearchGuestsRepository struct {
	client *opensearch.Client
}

func NewOpenSearchGuestsRepository(client *opensearch.Client) *OpenSearchGuestsRepository {
	return &OpenSearchGuestsRepository{client: client}
}

func (r *OpenSearchGuestsRepository) IndexGuest(ctx context.Context, doc *models.GuestDocument) error {
	body, err := json.Marshal(doc)
	if err != nil {
		return err
	}

	res, err := opensearchapi.IndexRequest{
		Index:      guestsIndex,
		DocumentID: doc.ID,
		Body:       bytes.NewReader(body),
	}.Do(ctx, r.client)
	if err != nil {
		return fmt.Errorf("indexing guest %s: %w", doc.ID, err)
	}
	defer res.Body.Close()

	if res.IsError() {
		return fmt.Errorf("indexing guest %s failed: %s", doc.ID, res.String())
	}
	return nil
}

func (r *OpenSearchGuestsRepository) DeleteGuest(ctx context.Context, id string) error {
	res, err := opensearchapi.DeleteRequest{
		Index:      guestsIndex,
		DocumentID: id,
	}.Do(ctx, r.client)
	if err != nil {
		return fmt.Errorf("deleting guest %s from index: %w", id, err)
	}
	defer res.Body.Close()

	if res.IsError() && res.StatusCode != 404 {
		return fmt.Errorf("deleting guest %s failed: %s", id, res.String())
	}
	return nil
}

func (r *OpenSearchGuestsRepository) SearchGuests(ctx context.Context, filters *models.GuestFilters) (*models.GuestPage, error) {
	query := buildGuestSearchQuery(filters)
	body, err := json.Marshal(query)
	if err != nil {
		return nil, err
	}

	res, err := opensearchapi.SearchRequest{
		Index: []string{guestsIndex},
		Body:  bytes.NewReader(body),
	}.Do(ctx, r.client)
	if err != nil {
		return nil, fmt.Errorf("searching guests: %w", err)
	}
	defer res.Body.Close()

	if res.IsError() {
		return nil, fmt.Errorf("guest search failed: %s", res.String())
	}

	var result struct {
		Hits struct {
			Hits []struct {
				Source models.GuestDocument `json:"_source"`
				Sort   []any                `json:"sort"`
			} `json:"hits"`
		} `json:"hits"`
	}
	if err := json.NewDecoder(res.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("decoding search response: %w", err)
	}

	hits := result.Hits.Hits
	var nextCursor *string
	if len(hits) == filters.Limit+1 {
		hits = hits[:filters.Limit]
		last := hits[filters.Limit-1]
		if len(last.Sort) >= 2 {
			encoded := fmt.Sprintf("%v|%v", last.Sort[0], last.Sort[1])
			nextCursor = &encoded
		}
	}

	guests := make([]*models.GuestWithBooking, 0, len(hits))
	for _, hit := range hits {
		doc := hit.Source
		guests = append(guests, &models.GuestWithBooking{
			ID:            doc.ID,
			FirstName:     doc.FirstName,
			LastName:      doc.LastName,
			PreferredName: doc.PreferredName,
			Floor:         doc.Floor,
			RoomNumber:    doc.RoomNumber,
			GroupSize:     doc.GroupSize,
		})
	}

	return &models.GuestPage{
		Data:       guests,
		NextCursor: nextCursor,
	}, nil
}

// buildGuestSearchQuery constructs the OpenSearch bool query from GuestFilters.
// Sort is by full_name.keyword ASC, id ASC — matching the Postgres query order
// and keeping cursor format compatible ("FirstName LastName|UUID").
func buildGuestSearchQuery(filters *models.GuestFilters) map[string]any {
	mustClauses := []any{
		map[string]any{"term": map[string]any{"hotel_id": filters.HotelID}},
		map[string]any{"term": map[string]any{"booking_status": "active"}},
	}

	var filterClauses []any
	if len(filters.Floors) > 0 {
		filterClauses = append(filterClauses, map[string]any{
			"terms": map[string]any{"floor": filters.Floors},
		})
	}
	if len(filters.GroupSize) > 0 {
		filterClauses = append(filterClauses, map[string]any{
			"terms": map[string]any{"group_size": filters.GroupSize},
		})
	}

	boolQuery := map[string]any{
		"must":   mustClauses,
		"filter": filterClauses,
	}

	if filters.Search != "" {
		boolQuery["should"] = []any{
			map[string]any{"match": map[string]any{"full_name": filters.Search}},
			map[string]any{"term": map[string]any{"room_number": filters.Search}},
		}
		boolQuery["minimum_should_match"] = 1
	}

	q := map[string]any{
		"query": map[string]any{"bool": boolQuery},
		"sort": []any{
			map[string]any{"full_name.keyword": "asc"},
			map[string]any{"id": "asc"},
		},
		"size": filters.Limit + 1,
	}

	if filters.CursorName != "" && filters.CursorID != "" {
		q["search_after"] = []any{filters.CursorName, filters.CursorID}
	}

	return q
}
