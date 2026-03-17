package utils

const DefaultPageLimit = 20

type CursorPagination struct {
	Cursor string `query:"cursor"                              doc:"Opaque cursor for the next page"`
	Limit  int    `query:"limit" minimum:"1" maximum:"100" default:"20" doc:"Number of items per page"`
}

func ResolveLimit(limit int) int {
	if limit <= 0 {
		return DefaultPageLimit
	}
	return limit
}

type CursorPage[T any] struct {
	Items      []T     `json:"items"`
	NextCursor *string `json:"next_cursor"` // nil when no more pages
	HasMore    bool    `json:"has_more"`
}

func BuildCursorPage[T any](items []T, limit int, cursorFn func(T) string) CursorPage[T] {
	limit = ResolveLimit(limit)
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
		rawCursor := cursorFn(last)
		page.NextCursor = &rawCursor
	}

	return page
}
