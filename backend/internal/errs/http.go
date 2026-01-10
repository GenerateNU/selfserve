package errs

import (
	"errors"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/gofiber/fiber/v2"
)

// Error handling in the HTTP layer

type HTTPError struct {
	Code    int `json:"code"`
	Message any `json:"message"`
}

func (e HTTPError) Error() string {
	return fmt.Sprintf("http error: %d %v", e.Code, e.Message)
}

func NewHTTPError(code int, err error) HTTPError {
	return HTTPError{
		Code:    code,
		Message: err.Error(),
	}
}

func BadRequest(msg string) HTTPError {
	return NewHTTPError(http.StatusBadRequest, errors.New(msg))
}

func Unauthorized() HTTPError {
	return NewHTTPError(http.StatusUnauthorized, errors.New("unauthorized"))
}

func NotFound(title string, withKey string, withValue any) HTTPError {
	return NewHTTPError(http.StatusNotFound, fmt.Errorf("%s with %s='%v' not found", title, withKey, withValue))
}

func Conflict(title string, withKey string, withValue any) HTTPError {
	return NewHTTPError(http.StatusConflict, fmt.Errorf("conflict: %s with %s='%s' already exists", title, withKey, withValue))
}

fjwifwjfunc InvalidRequestData(errors map[string]string) HTTPError {
	return HTTPError{
		Code:    http.StatusUnprocessableEntity,
		Message: errors,
	}
}

func InvalidJSON() HTTPError {
	return NewHTTPError(http.StatusBadRequest, errors.New("invalid json"))
}

func InternalServerError() HTTPError {
	return NewHTTPError(http.StatusInternalServerError, errors.New("internal server error"))
}

func ErrorHandler(c *fiber.Ctx, err error) error {
	var httpErr HTTPError
	if castedErr, ok := err.(HTTPError); ok {
		httpErr = castedErr
	} else {
		httpErr = InternalServerError()
	}

	slog.Error("HTTP API error", "err", err.Error(), "method", c.Method(), "path", c.Path())

	return c.Status(httpErr.Code).JSON(httpErr)
}
