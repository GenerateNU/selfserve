package validation

import (
	"reflect"
	"strings"

	"github.com/go-playground/validator/v10"
	nonstandard "github.com/go-playground/validator/v10/non-standard/validators"
)

var Validate *validator.Validate

func Init() {
	validatorInstance := validator.New(validator.WithRequiredStructEnabled())

	validatorInstance.RegisterTagNameFunc(func(field reflect.StructField) string {
		jsonTag := field.Tag.Get("json")
		jsonName := strings.SplitN(jsonTag, ",", 2)[0]

		if jsonName == "" {
			return field.Name
		}
		if jsonName == "-" {
			return ""
		}
		return jsonName
	})

	_ = validatorInstance.RegisterValidation("notblank", nonstandard.NotBlank)

	Validate = validatorInstance
}
