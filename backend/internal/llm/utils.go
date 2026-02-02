package llm

import (
	"strings"

	"github.com/google/uuid"
)

func sanitizeStringPtr(s *string) *string {
	if s == nil {
		return nil
	}
	val := strings.TrimSpace(*s)
	if val == "null" || val == "nil" || val == "" || strings.HasPrefix(val, "unknown_") {
		return nil
	}
	return &val
}

func sanitizeUUIDPtr(s *string) *string {
	if s == nil {
		return nil
	}
	val := strings.TrimSpace(*s)
	// If the value is empty, a placeholder, or not a valid UUID, return nil
	if val == "" || val == "null" || val == "nil" || strings.HasPrefix(val, "unknown_") {
		return nil
	}
	// Validate that it's actually a UUID
	if _, err := uuid.Parse(val); err != nil {
		return nil
	}
	return &val
}