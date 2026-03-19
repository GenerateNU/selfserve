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
	)

	// fiber adaptor to convert the http.Handler to fiber handler
	return adaptor.HTTPHandler(handler)(c)
}
