APP_NAME := selfserve
CMD_PATH := ./cmd/server
DOCKER_IMAGE_NAME := selfserve-backend
PORT := 8080
ENV_FILE := config/.env
LOAD_ENV := doppler run --
LLM_URL := http://127.0.0.1:11434

.PHONY: all build run dev test format tidy download clean docker-build docker-run docker-token docker-up docker-down \
        migrate-new migrate-up migrate-down migrate-status migrate-reset db-start db-stop db-reset swagger swagger-fmt docker-build docker-run llm-start genkit-run seed cli

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

cli:
	@$(LOAD_ENV) go run ./cmd/cli $(filter-out $@,$(MAKECMDGOALS))

seed:
	@$(LOAD_ENV) bash scripts/seed.sh

test:
	@$(LOAD_ENV) \
	go test ./...

format:
	@go fmt ./...
	@goimports -w $$(find . -name "*.go" -not -path "*/vendor/*")

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

docker-token:
	@echo "export DOPPLER_TOKEN=$$(doppler configs tokens create docker --project selfserve-backend --config prd --plain)"

docker-up:
	@docker compose up --build

docker-down:
	docker compose down

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