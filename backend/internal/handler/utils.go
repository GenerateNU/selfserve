package handler

import (
	"github.com/google/uuid"
)

func validUUID(s string) bool {
	_, err := uuid.Parse(s)
	return err == nil
}
