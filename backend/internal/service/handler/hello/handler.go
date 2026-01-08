package hello

import (
	"github.com/gofiber/fiber/v2"
)

type Handler struct {
}

func NewHandler() *Handler {
	return &Handler{}
}

func (h *Handler) GetHello(c *fiber.Ctx) error {
	return c.SendString("Yogurt. Gurt: Yo!")
}

func (h *Handler) GetHelloName(c *fiber.Ctx) error {
	name := c.Params("name")
	return c.SendString("Yo, " + name + "!")
}
