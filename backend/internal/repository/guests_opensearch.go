package repository

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/generate/selfserve/internal/models"
	opensearchstorage "github.com/generate/selfserve/internal/service/storage/opensearch"
	opensearch "github.com/opensearch-project/opensearch-go/v2"
	"github.com/opensearch-project/opensearch-go/v2/opensearchapi"
)

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
		Index:      opensearchstorage.GuestsIndex,
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

func (r *OpenSearchGuestsRepository) BulkIndexGuests(ctx context.Context, docs []*models.GuestDocument) error {
	if len(docs) == 0 {
		return nil
	}

	var body bytes.Buffer
	for _, doc := range docs {
		meta := fmt.Sprintf(`{"index":{"_index":%q,"_id":%q}}`, opensearchstorage.GuestsIndex, doc.ID)
		body.WriteString(meta)
		body.WriteByte('\n')
		serialized, err := json.Marshal(doc)
		if err != nil {
			return fmt.Errorf("marshaling guest %s: %w", doc.ID, err)
		}
		body.Write(serialized)
		body.WriteByte('\n')
	}

	res, err := opensearchapi.BulkRequest{
		Body: &body,
	}.Do(ctx, r.client)
	if err != nil {
		return fmt.Errorf("bulk indexing guests: %w", err)
	}
	defer res.Body.Close()

	if res.IsError() {
		return fmt.Errorf("bulk index failed: %s", res.String())
	}

	var result struct {
		Errors bool `json:"errors"`
		Items  []map[string]struct {
			ID     string `json:"_id"`
			Status int    `json:"status"`
			Error  *struct {
				Reason string `json:"reason"`
			} `json:"error,omitempty"`
		} `json:"items"`
	}
	if err := json.NewDecoder(res.Body).Decode(&result); err != nil {
		return fmt.Errorf("decoding bulk response: %w", err)
	}

	if result.Errors {
		var errs []string
		for _, item := range result.Items {
			for _, op := range item {
				if op.Error != nil {
					errs = append(errs, fmt.Sprintf("id=%s: %s", op.ID, op.Error.Reason))
				}
			}
		}
		return fmt.Errorf("bulk index partial failure: %s", strings.Join(errs, "; "))
	}

	return nil
}

func (r *OpenSearchGuestsRepository) DeleteGuest(ctx context.Context, id string) error {
	deleteResponse, err := opensearchapi.DeleteRequest{
		Index:      opensearchstorage.GuestsIndex,
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
		Index: []string{opensearchstorage.GuestsIndex},
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

	// Group hits by guest ID — a guest with multiple active bookings produces multiple OpenSearch documents.
	// We deduplicate here, aggregating all active booking rooms and taking stats from the first hit.
	type guestEntry struct {
		guest    *models.GuestWithBooking
		sortVals []any
	}
	guestMap := make(map[string]*guestEntry)
	var orderedIDs []string

	for _, hit := range decodedSearchResult.Hits.Hits {
		doc := hit.GuestDocument
		if _, exists := guestMap[doc.ID]; !exists {
			guestMap[doc.ID] = &guestEntry{
				guest: &models.GuestWithBooking{
					ID:             doc.ID,
					FirstName:      doc.FirstName,
					LastName:       doc.LastName,
					PreferredName:  doc.PreferredName,
					Assistance:     doc.Assistance,
					RequestCount:   doc.RequestCount,
					HasUrgent:      doc.HasUrgent,
					ActiveBookings: models.ActiveBookings{},
				},
				sortVals: hit.SortValues,
			}
			orderedIDs = append(orderedIDs, doc.ID)
		}
		guestMap[doc.ID].guest.ActiveBookings = append(
			guestMap[doc.ID].guest.ActiveBookings,
			models.ActiveBooking{Floor: doc.Floor, RoomNumber: doc.RoomNumber},
		)
	}

	var nextCursor *string
	resultIDs := orderedIDs
	if len(orderedIDs) == filters.Limit+1 {
		resultIDs = orderedIDs[:filters.Limit]
		lastEntry := guestMap[orderedIDs[filters.Limit-1]]
		if len(lastEntry.sortVals) >= 2 {
			encodedCursor := fmt.Sprintf("%v|%v", lastEntry.sortVals[0], lastEntry.sortVals[1])
			nextCursor = &encodedCursor
		}
	}

	guestResults := make([]*models.GuestWithBooking, 0, len(resultIDs))
	for _, id := range resultIDs {
		guestResults = append(guestResults, guestMap[id].guest)
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

	openSearchQuery := map[string]any{
		"query": map[string]any{"bool": boolQuery},
		"sort": []any{
			map[string]any{"full_name.keyword": "asc"},
			map[string]any{"id": "asc"},
		},
		"size": filters.Limit + 1,
	}

	if filters.CursorName != "" && filters.CursorID != "" {
		openSearchQuery["search_after"] = []any{filters.CursorName, filters.CursorID}
	}

	return openSearchQuery
}
