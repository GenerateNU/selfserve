APP_NAME := selfserve
CMD_PATH := ./cmd/server
DOCKER_IMAGE_NAME := selfserve-backend
PORT := 8080
ENV_FILE := config/.env
LOAD_ENV := set -a; [ -f $(ENV_FILE) ] && . $(ENV_FILE); set +a;
LLM_URL := http://127.0.0.1:11434

.PHONY: all build run dev test format tidy download clean docker-build docker-run \
        migrate-new migrate-up migrate-down migrate-status migrate-reset db-start db-stop db-reset db-setup-env swagger swagger-fmt docker-build docker-run llm-start genkit-run

all: build

build: swagger
	go build -o bin/$(APP_NAME) $(CMD_PATH)

llm-start:
	@if curl -sf $(LLM_URL)/api/tags >/dev/null 2>&1; then \
		echo "LLM already running"; \
	else \
		echo "Starting LLM..."; \
		llm serve >/dev/null 2>&1 & \
		sleep 2; \
	fi

run: llm-start db-start
	@$(LOAD_ENV) \
	go run $(CMD_PATH)

air: llm-start db-start
	@$(LOAD_ENV) \
	air

ngrok: 
	@$(LOAD_ENV) ngrok http --domain=$$NGROK_DOMAIN $(PORT)

dev: llm-start db-start clean build
	@$(LOAD_ENV) \
	./bin/$(APP_NAME)

genkit-run: llm-start db-start
	@$(LOAD_ENV) \
	genkit start -- go run $(CMD_PATH)

sync-users:
	@$(LOAD_ENV) go run ./cmd/clerk/sync.go

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
	$$(go env GOPATH)/bin/swag init -g cmd/server/main.go -o docs --parseDependency --parseInternal

swagger-fmt:
	$$(go env GOPATH)/bin/swag fmt

docker-build:
	docker build -t $(DOCKER_IMAGE_NAME) .

docker-run:
	@docker run --rm -p $(PORT):$(PORT) \
		$(shell [ -f $(ENV_FILE) ] && echo "--env-file $(ENV_FILE)") \
		--name $(APP_NAME)-container \
		$(DOCKER_IMAGE_NAME)

# =============================================================================
# Supabase Migrations
# =============================================================================

# Create a new migration file: make migrate-new name=create_users_table
migrate-new:
	@if [ -z "$(name)" ]; then \
		echo "Usage: make migrate-new name=<migration_name>"; \
		exit 1; \
	fi
	supabase migration new $(name)

# Apply all pending migrations
migrate-up:
	supabase migration up

# Roll back migrations (requires manual confirmation)
migrate-down:
	supabase migration down

# Show migration status
migrate-status:
	supabase migration list

# Reset database and reapply all migrations
migrate-reset:
	supabase db reset

# =============================================================================
# Supabase Local Development
# =============================================================================

# Start local Supabase stack
db-start:
	supabase start

# Stop local Supabase stack
db-stop:
	supabase stop

# Reset local database (stops, clears, restarts)
db-reset:
	supabase db reset

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