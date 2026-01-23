package handler

import (
	storage "github.com/generate/selfserve/internal/service/storage/postgres"
	"github.com/gofiber/fiber/v2"
)


type ClerkHandler struct {
	UsersRepository storage.UsersRepository
}


func newClerkHandler(userRepo storage.UsersRepository) *ClerkHandler {
	return &ClerkHandler{UsersRepository: userRepo}
}


func (h *ClerkHandler) CreateUser(c *fiber.Ctx) error {
	
}

