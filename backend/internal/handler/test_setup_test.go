package handler

import (
	"os"
	"testing"

	"github.com/generate/selfserve/internal/validation"
)

func TestMain(m *testing.M) {
	validation.Init()
	os.Exit(m.Run())
}
