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
	serializedDoc, err := json.Marshal(doc)
	if err != nil {
		return err
	}

	indexResponse, err := opensearchapi.IndexRequest{
		Index:      guestsIndex,
		DocumentID: doc.ID,
		Body:       bytes.NewReader(serializedDoc),
	}.Do(ctx, r.client)
	if err != nil {
		return fmt.Errorf("indexing guest %s: %w", doc.ID, err)
	}
	defer indexResponse.Body.Close()

	if indexResponse.IsError() {
		return fmt.Errorf("indexing guest %s failed: %s", doc.ID, indexResponse.String())
	}
	return nil
}

func (r *OpenSearchGuestsRepository) DeleteGuest(ctx context.Context, id string) error {
	deleteResponse, err := opensearchapi.DeleteRequest{
		Index:      guestsIndex,
		DocumentID: id,
	}.Do(ctx, r.client)
	if err != nil {
		return fmt.Errorf("deleting guest %s from index: %w", id, err)
	}
	defer deleteResponse.Body.Close()

	if deleteResponse.IsError() && deleteResponse.StatusCode != 404 {
		return fmt.Errorf("deleting guest %s failed: %s", id, deleteResponse.String())
	}
	return nil
}

func (r *OpenSearchGuestsRepository) SearchGuests(ctx context.Context, filters *models.GuestFilters) (*models.GuestPage, error) {
	searchQuery := buildGuestSearchQuery(filters)
	serializedQuery, err := json.Marshal(searchQuery)
	if err != nil {
		return nil, err
	}

	searchResponse, err := opensearchapi.SearchRequest{
		Index: []string{guestsIndex},
		Body:  bytes.NewReader(serializedQuery),
	}.Do(ctx, r.client)
	if err != nil {
		return nil, fmt.Errorf("searching guests: %w", err)
	}
	defer searchResponse.Body.Close()

	if searchResponse.IsError() {
		return nil, fmt.Errorf("guest search failed: %s", searchResponse.String())
	}

	var decodedSearchResult struct {
		Hits struct {
			Hits []struct {
				GuestDocument models.GuestDocument `json:"_source"`
				SortValues    []any                `json:"sort"`
			} `json:"hits"`
		} `json:"hits"`
	}
	if err := json.NewDecoder(searchResponse.Body).Decode(&decodedSearchResult); err != nil {
		return nil, fmt.Errorf("decoding search response: %w", err)
	}

	searchHits := decodedSearchResult.Hits.Hits
	var nextCursor *string
	if len(searchHits) == filters.Limit+1 {
		searchHits = searchHits[:filters.Limit]
		lastHit := searchHits[filters.Limit-1]
		if len(lastHit.SortValues) >= 2 {
			encodedCursor := fmt.Sprintf("%v|%v", lastHit.SortValues[0], lastHit.SortValues[1])
			nextCursor = &encodedCursor
		}
	}

	guestResults := make([]*models.GuestWithBooking, 0, len(searchHits))
	for _, hit := range searchHits {
		guestDoc := hit.GuestDocument
		guestResults = append(guestResults, &models.GuestWithBooking{
			ID:            guestDoc.ID,
			FirstName:     guestDoc.FirstName,
			LastName:      guestDoc.LastName,
			PreferredName: guestDoc.PreferredName,
			Floor:         guestDoc.Floor,
			RoomNumber:    guestDoc.RoomNumber,
			GroupSize:     guestDoc.GroupSize,
		})
	}

	return &models.GuestPage{
		Data:       guestResults,
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
