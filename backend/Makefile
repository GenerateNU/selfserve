APP_NAME := selfserve
CMD_PATH := ./cmd/server
DOCKER_IMAGE_NAME := selfserve-backend
PORT := 8080
ENV_FILE := config/.env
LOAD_ENV := set -a; [ -f $(ENV_FILE) ] && . $(ENV_FILE); set +a;

.PHONY: all build run dev test format tidy download clean swagger swagger-fmt docker-build docker-run

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

swagger:
	$(HOME)/go/bin/swag init -g cmd/server/main.go -o docs --parseDependency --parseInternal

swagger-fmt:
	$(HOME)/go/bin/swag fmt

docker-build:
	docker build -t $(DOCKER_IMAGE_NAME) .

docker-run:
	@docker run --rm -p $(PORT):$(PORT) \
		$(shell [ -f $(ENV_FILE) ] && echo "--env-file $(ENV_FILE)") \
		--name $(APP_NAME)-container \
		$(DOCKER_IMAGE_NAME)
