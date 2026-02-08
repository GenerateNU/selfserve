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
