package handler

import (
	"github.com/gofiber/adaptor/v2"
	"github.com/gofiber/fiber/v2"
	httpSwagger "github.com/swaggo/http-swagger"
)

// ServeSwagger wraps the http-swagger handler for Fiber using adaptor
func ServeSwagger(c *fiber.Ctx) error {
	handler := httpSwagger.Handler(
		httpSwagger.URL("/swagger/doc.json"),
		// saves token to localStorage for convenience
		httpSwagger.UIConfig(map[string]string{
			"persistAuthorization": "true",
		}),
	)

	return adaptor.HTTPHandler(handler)(c)
}
