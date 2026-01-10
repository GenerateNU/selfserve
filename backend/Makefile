APP_NAME := selfserve
CMD_PATH := ./cmd/server

.PHONY: all build run dev test format tidy download clean

all: build

build:
	go build -o bin/$(APP_NAME) $(CMD_PATH)

run:
	air

dev: clean
	air

test:
	go test ./...

format:
	go fmt ./...

tidy:
	go mod tidy

download:
	go mod download

clean:
	rm -rf bin


