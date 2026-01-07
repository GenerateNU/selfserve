package main

import (
	"log"

	"github.com/joho/godotenv"
	"github.com/sethvargo/go-envconfig"
)

func main() {
	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Fatal("failed to load .env:", err)
	}

}
