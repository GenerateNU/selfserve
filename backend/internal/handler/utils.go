package handler

import (
	"sort"
	"strings"

	"github.com/generate/selfserve/internal/errs"
	"github.com/google/uuid"
)

func validUUID(s string) bool {
	_, err := uuid.Parse(s)
	return err == nil
}

func AggregateErrors(errors map[string]string) error {
	if len(errors) > 0 {
		var keys []string
		for k := range errors {
			keys = append(keys, k)
		}
		sort.Strings(keys)

		var parts []string
		for _, k := range keys {
			parts = append(parts, k+": "+errors[k])
		}
		return errs.BadRequest(strings.Join(parts, ", "))
	}

	return nil
}
