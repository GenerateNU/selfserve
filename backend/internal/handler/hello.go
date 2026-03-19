package handler

import (
	"github.com/gofiber/fiber/v2"
)

type Handler struct {
}

func NewHelloHandler() *Handler {
	return &Handler{}
}

// GetHello godoc
// @Summary      Get hello message
// @Description  Returns a simple hello message
// @Tags         hello
// @Accept       json
// @Produce      plain
// @Success      200  {string}  string  "Yogurt. Gurt: Yo!"
// @Router       /hello [get]
func (h *Handler) GetHello(c *fiber.Ctx) error {
	return c.SendString("Yogurt. Gurt: Yo!")
}

// GetHelloName godoc
// @Summary      Get personalized hello message
// @Description  Returns a hello message with the provided name
// @Tags         hello
// @Accept       json
// @Produce      plain
// @Param        name  path  string  true  "Name to greet"
// @Success      200  {string}  string  "Yo, {name}!"
// @Router       /hello/{name} [get]
func (h *Handler) GetHelloName(c *fiber.Ctx) error {
	name := c.Params("name")
	return c.SendString("Yo, " + name + "!")
}
