APP_NAME := selfserve
CMD_PATH := ./cmd/server
ENV_FILE := config/.env
LOAD_ENV := set -a; [ -f $(ENV_FILE) ] && . $(ENV_FILE); set +a;

.PHONY: all build run dev test format tidy download clean

all: build

build:
	go build -o bin/$(APP_NAME) $(CMD_PATH)

run:
	@$(LOAD_ENV) \
	go run $(CMD_PATH)

dev: clean build
	@$(LOAD_ENV) \
	./bin/$(APP_NAME)

test:
	@$(LOAD_ENV) \
	go test ./...

format:
	go fmt ./...

tidy:
	go mod tidy

download:
	go mod download

clean:
	rm -rf bin


