APP_NAME := selfserve
CMD_PATH := ./cmd/server
DOCKER_IMAGE_NAME := selfserve-backend
PORT := 8080

.PHONY: all build run dev test format tidy download clean docker-build docker-run

all: build

build:
	go build -o bin/$(APP_NAME) $(CMD_PATH)

run:
	go run $(CMD_PATH)

dev: clean build
	./bin/$(APP_NAME)

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

docker-build:
	docker build -t $(DOCKER_IMAGE_NAME) .

docker-run:
	docker run --rm -p $(PORT):$(PORT) --name $(APP_NAME)-container $(DOCKER_IMAGE_NAME)
