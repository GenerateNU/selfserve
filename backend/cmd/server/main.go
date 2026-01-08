package main

import (
	"github.com/joho/godotenv"

	errs "github.com/generate/selfserve/internal/errs"
)

func main() {
	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		errs.FatalError("failed to load .env:", err)
	}

}
