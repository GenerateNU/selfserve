package utils

import (
	"encoding/base64"
	"fmt"
	"strconv"
	"strings"
)

type CursorPagination struct {
	Cursor string `query:"cursor"                              doc:"Opaque cursor for the next page"`
	Limit  int    `query:"limit" minimum:"1" maximum:"100" default:"20" doc:"Number of items per page"`
}

type CursorPage[T any] struct {
	Items      []T     `json:"items"`
	NextCursor *string `json:"next_cursor"` // nil when no more pages
	HasMore    bool    `json:"has_more"`
}

// DecodedCursor holds the parsed internals of an opaque cursor.
type DecodedCursor struct {
	Column string
	Value  string
}

// EncodeCursor builds an opaque cursor from a column name and its last-seen value.
// e.g. EncodeCursor("id", "42") → base64("id:42")
func EncodeCursor(column, value string) string {
	raw := fmt.Sprintf("%s:%s", column, value)
	return base64.StdEncoding.EncodeToString([]byte(raw))
}

// DecodeCursor parses a cursor string back into its column/value parts.
func DecodeCursor(cursor string) (*DecodedCursor, error) {
	if cursor == "" {
		return nil, nil
	}
	b, err := base64.StdEncoding.DecodeString(cursor)
	if err != nil {
		return nil, fmt.Errorf("invalid cursor: %w", err)
	}
	parts := strings.SplitN(string(b), ":", 2)
	if len(parts) != 2 {
		return nil, fmt.Errorf("invalid cursor format")
	}
	return &DecodedCursor{Column: parts[0], Value: parts[1]}, nil
}

func DecodeCursorInt(cursor string) (*DecodedCursor, int, error) {
	c, err := DecodeCursor(cursor)
	if err != nil || c == nil {
		return c, 0, err
	}
	id, err := strconv.Atoi(c.Value)
	if err != nil {
		return nil, 0, fmt.Errorf("cursor value is not an integer: %w", err)
	}
	return c, id, nil
}

func BuildCursorPage[T any](items []T, limit int, cursorFn func(T) string) CursorPage[T] {
	hasMore := len(items) > limit
	if hasMore {
		items = items[:limit]
	}

	page := CursorPage[T]{
		Items:   items,
		HasMore: hasMore,
	}

	if hasMore && len(items) > 0 {
		last := items[len(items)-1]
		encoded := EncodeCursor("id", cursorFn(last))
		page.NextCursor = &encoded
	}

	return page
}