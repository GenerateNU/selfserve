package validation

import (
	"errors"
	"fmt"

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
		default:
			fieldErrors[fieldName] = fmt.Sprintf("failed validation: %s", fieldError.Tag())
		}
	}

	return fieldErrors
}
