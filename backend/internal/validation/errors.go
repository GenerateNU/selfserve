package validation

import (
	"errors"
	"fmt"
	"sort"
	"strings"

	"github.com/go-playground/validator/v10"
)

func ToFieldErrors(err error) map[string]string {
	fieldErrors := map[string]string{}
	if err == nil {
		return fieldErrors
	}

	var validationErrors validator.ValidationErrors
	if !errors.As(err, &validationErrors) {
		fieldErrors["_error"] = "invalid request"
		return fieldErrors
	}

	for _, fieldError := range validationErrors {
		fieldName := fieldError.Field() // json name because of RegisterTagNameFunc

		switch fieldError.Tag() {
		case "required":
			fieldErrors[fieldName] = "is required"
		case "notblank":
			fieldErrors[fieldName] = "must not be an empty string"
		case "uuid":
			fieldErrors[fieldName] = "invalid uuid"
		case "timezone":
			fieldErrors[fieldName] = "invalid IANA timezone"
		default:
			fieldErrors[fieldName] = fmt.Sprintf("failed validation: %s", fieldError.Tag())
		}
	}

	return fieldErrors
}

func DeterministicErrorString(fieldErrors map[string]string) string {
	if len(fieldErrors) == 0 {
		return ""
	}

	keys := make([]string, 0, len(fieldErrors))
	for key := range fieldErrors {
		keys = append(keys, key)
	}
	sort.Strings(keys)

	parts := make([]string, 0, len(keys))
	for _, key := range keys {
		parts = append(parts, key+": "+fieldErrors[key])
	}
	return strings.Join(parts, ", ")
}
