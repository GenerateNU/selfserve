APP_NAME := selfserve
CMD_PATH := ./cmd/server
DOCKER_IMAGE_NAME := selfserve-backend
PORT := 8080
ENV_FILE := config/.env
LOAD_ENV := set -a; [ -f $(ENV_FILE) ] && . $(ENV_FILE); set +a;

.PHONY: all build run dev test format tidy download clean docker-build docker-run

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

docker-build:
	docker build -t $(DOCKER_IMAGE_NAME) .

docker-run:
	@docker run --rm -p $(PORT):$(PORT) \
		$(shell [ -f $(ENV_FILE) ] && echo "--env-file $(ENV_FILE)") \
		--name $(APP_NAME)-container \
		$(DOCKER_IMAGE_NAME)

# Set up .env file with local Supabase connection details
# This creates or updates config/.env with local Supabase defaults
db-setup-env:
	@echo "Setting up $(ENV_FILE) for local Supabase..."
	@if [ ! -f $(ENV_FILE) ]; then \
		echo "# Application Configuration" > $(ENV_FILE); \
		echo "APP_PORT=8080" >> $(ENV_FILE); \
		echo "APP_LOG_LEVEL=info" >> $(ENV_FILE); \
		echo "" >> $(ENV_FILE); \
		echo "# Database Configuration (Local Supabase)" >> $(ENV_FILE); \
		echo "DB_HOST=localhost" >> $(ENV_FILE); \
		echo "DB_PORT=54322" >> $(ENV_FILE); \
		echo "DB_USER=postgres" >> $(ENV_FILE); \
		echo "DB_PASSWORD=postgres" >> $(ENV_FILE); \
		echo "DB_NAME=postgres" >> $(ENV_FILE); \
		echo "DB_MAX_CONNS=8" >> $(ENV_FILE); \
		echo "DB_MAX_CONN_LIFETIME=30s" >> $(ENV_FILE); \
		echo "Created $(ENV_FILE) with local Supabase defaults"; \
	else \
		echo "$(ENV_FILE) already exists. Updating DB_* variables..."; \
		grep -v "^DB_" $(ENV_FILE) > $(ENV_FILE).tmp || true; \
		echo "" >> $(ENV_FILE).tmp; \
		echo "# Database Configuration (Local Supabase)" >> $(ENV_FILE).tmp; \
		echo "DB_HOST=localhost" >> $(ENV_FILE).tmp; \
		echo "DB_PORT=54322" >> $(ENV_FILE).tmp; \
		echo "DB_USER=postgres" >> $(ENV_FILE).tmp; \
		echo "DB_PASSWORD=postgres" >> $(ENV_FILE).tmp; \
		echo "DB_NAME=postgres" >> $(ENV_FILE).tmp; \
		echo "DB_MAX_CONNS=8" >> $(ENV_FILE).tmp; \
		echo "DB_MAX_CONN_LIFETIME=30s" >> $(ENV_FILE).tmp; \
		mv $(ENV_FILE).tmp $(ENV_FILE); \
		echo "Updated DB_* variables in $(ENV_FILE)"; \
	fi
	@echo ""
	@echo "Note: Make sure Supabase is running locally with 'make db-start'"