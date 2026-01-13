APP_NAME := selfserve
CMD_PATH := ./cmd/server
DOCKER_IMAGE_NAME := selfserve-backend
PORT := 8080
ENV_FILE := config/.env
LOAD_ENV := set -a; [ -f $(ENV_FILE) ] && . $(ENV_FILE); set +a;

.PHONY: all build run dev test format tidy download clean docker-build docker-run \
        migrate-new migrate-up migrate-down migrate-status migrate-reset db-start db-stop db-reset

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