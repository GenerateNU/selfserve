package httpx

import (
	"github.com/generate/selfserve/internal/errs"
	"github.com/generate/selfserve/internal/validation"
	"github.com/gofiber/fiber/v2"
)

func BindAndValidate[T any](context *fiber.Ctx, output *T) error {
	if validation.Validate == nil {
		return errs.InternalServerError()
	}

	if err := context.BodyParser(output); err != nil {
		return errs.InvalidJSON()
	}

	if err := validation.Validate.Struct(*output); err != nil {
		fieldErrors := validation.ToFieldErrors(err)
		return errs.BadRequest(validation.DeterministicErrorString(fieldErrors))
	}

	return nil
}

// Validate validates a struct that has already been populated from non-body sources
// (path params, query strings, headers). Use this instead of BindAndValidate for
// GET endpoints where there is no request body to parse.
func Validate[T any](output *T) error {
	if validation.Validate == nil {
		return errs.InternalServerError()
	}

	if err := validation.Validate.Struct(*output); err != nil {
		fieldErrors := validation.ToFieldErrors(err)
		return errs.BadRequest(validation.DeterministicErrorString(fieldErrors))
	}

	return nil
}
