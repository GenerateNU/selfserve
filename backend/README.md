# Backend Architecture

## Setup

### Prerequisites

- **Go 1.24.0 or later** - [Install Go](https://go.dev/doc/install)
- **Doppler CLI** - [Install Doppler](https://docs.doppler.com/docs/install-cli) or `brew install dopplerhq/cli/doppler`

### Installation Steps

1. **Install Air (hot reload tool)**:
   ```bash
   go install github.com/air-verse/air@latest
   ```
2. **Install LLM Provider**:
   ```bash
   brew install ollama
   ollama serve
   ollama pull qwen2.5:7b-instruct
   ```
3. **Download dependencies**:

   ```bash
   make download
   ```

4. **Set up Doppler secrets management**:

   a. Authenticate with Doppler (first time only):

   ```bash
   doppler login
   ```

   b. Set up the backend project:

   ```bash
   cd backend
   doppler setup
   ```

   This will configure your local environment to use the `selfserve-backend` project with the `dev` config

5. **Start local Supabase**:

   ```bash
   make db-start
   ```

6. **Run with hot reload** (development):

   ```bash
   make air
   ```

   Or run directly without hot reload:

   ```bash
   make run
   ```

   Or build and run:

   ```bash
   make dev
   ```

## Directory Structure

```
backend/
├── cmd/
│   └── server/
│       └── main.go                  # Application entry point
├── config/
│   ├── application.go               # Application config (port, log level)
│   ├── config.go                    # App configuration
│   └── db.go                        # Database configuration
├── internal/
│   ├── errs/
│   │   ├── http.go                  # HTTP error handling
│   │   └── repository.go            # Repository/DB level errors
│   ├── handler/
│   │   ├── devs.go                  # Handler
│   │   ├── devs_test.go             # Test for handler
│   │   ├── hello.go                 # Handler
│   │   └── hello_test.go            # Tests for handler
│   ├── aiflows/
│   │   ├── prompts/
│   │   |   └── generate_request.go  # Prompts for flows
│   │   ├── flows.go                 # GenKit flows
│   │   ├── genkit.go                # Service setup
│   │   ├── service.go               # AI flows service interface
│   │   └── types.go                 # Schema
│   ├── models/
│   │   └── devs.go                  # Schema
│   ├── repository/
│   │   └── devs.go                  # Data accessors
│   └── service/
│       ├── server.go                # Fiber app setup & routing
│       └── storage/
│           └── postgres/
│               └── storage.go       # PostgreSQL DB config
├── bin/
│   └── selfserve                    # Compiled binary
├── Makefile                         # Build & development commands
├── go.mod                           # Go module dependencies
└── go.sum                           # Dependency checksums
```

## Architecture Overview

Logic traversal:

```
┌─────────────────────────────────────────┐
│          HTTP Layer (Fiber)             │
│  Handlers (internal/handler/)           │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│       Repository Layer                  │
│  (internal/repository/)                 │
│  Communication with Database            │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│       Storage Layer                     │
│  (internal/service/storage/postgres/)   │
│  The Database itself                    │
└─────────────────────────────────────────┘
```

### Components

- **cmd/server/main.go**: Application entry point, handles configuration loading, graceful shutdown, and server lifecycle
- **config/**: Configuration management using environment variables via `go-envconfig`
- **internal/handler/**: HTTP handlers that process requests, validate input, and return responses
- **internal/repository/**: Data access layer that abstracts database operations
- **internal/service/storage/**: Low-level database connection management (PostgreSQL with pgxpool)
- **internal/models/**: Domain models/data structures
- **internal/errs/**: Centralized error handling for HTTP and repository layers

### Key Technologies

- **Server**: [Fiber](https://gofiber.io/) - HTTP server framework
- **Database**: [Supabase](https://supabase.com/) - PostgreSQL database platform
- **Hot Reload**: [Air](https://github.com/cosmtrek/air) - Live hot reload of server

## Development

```bash
# Build
make build

# Run
make air    # Hot reload

# Or run directly
make run

# Or build and run
make dev

# Run tests
make test

# Format code
make format

# Clean build artifacts
make clean
```

## Configuration

The application reads configuration from environment variables injected by Doppler:

See config/.env.sample
