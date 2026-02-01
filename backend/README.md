# Backend Architecture

## Setup

### Prerequisites

- **Go 1.24.0 or later** - [Install Go](https://go.dev/doc/install)

### Installation Steps

1. **Install Air (hot reload tool)**:
   ```bash
   go install github.com/air-verse/air@latest
   ```
2. **Install Ollama**:
   ```bash
   brew install ollama
   ollama serve
   ollama pull llama3.2
   ```
3. **Download dependencies**:
   ```bash
   make download
   ```

4. **Set up environment variables**:
   
   (Slack us for these)
   Create a `config/.env` file with the following variables:
   ```env
   # Application Configuration
   APP_PORT=8080
   APP_LOG_LEVEL=info

   # Database Configuration (required)
   DB_HOST=your-database-host
   DB_PORT=5432
   DB_USER=your-database-user
   DB_PASSWORD=your-database-password
   DB_NAME=your-database-name
   DB_MAX_CONNS=8
   DB_MAX_CONN_LIFETIME=30s
   ```

   > **Note**: All database variables (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME) are required. The application will fail to start if they are missing.

   **Ollama (local LLM)** – used for parsing request text (e.g. `/request/from-text`). Optional; defaults apply if unset:
   ```env
   OLLAMA_SERVER_ADDRESS=http://127.0.0.1:11434
   OLLAMA_MODEL=llama3.2
   OLLAMA_TIMEOUT=60
   ```
   Install [Ollama](https://ollama.com/download), start the server, then run `ollama pull llama3.2`.

5. **Run with hot reload** (development):
   ```bash
   air
   ```

   Or run directly:
   ```bash
   make dev
   ```


## Directory Structure

```
backend/
├── cmd/
│   └── server/
│       └── main.go              # Application entry point
├── config/
│   ├── application.go           # Application config (port, log level)
│   ├── config.go                # App configuration
│   └── db.go                    # Database configuration
├── internal/
│   ├── errs/
│   │   ├── http.go              # HTTP error handling
│   │   └── repository.go        # Repository/DB level errors
│   ├── handler/
│   │   ├── devs.go              # Handler
│   │   ├── devs_test.go         # Test for handler
│   │   ├── hello.go             # Handler
│   │   └── hello_test.go        # Tests for handler
│   ├── models/
│   │   └── devs.go              # Schema
│   ├── repository/
│   │   └── devs.go              # Data accessors
│   └── service/
│       ├── server.go            # Fiber app setup & routing
│       └── storage/
│           └── postgres/
│               └── storage.go   # PostgreSQL DB config
├── bin/
│   └── selfserve                # Compiled binary
├── Makefile                     # Build & development commands
├── go.mod                       # Go module dependencies
└── go.sum                       # Dependency checksums
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
make run

# Build and run
make dev

# OR air to build and run if you installed air above
air

# Run tests
make test

# Format code
make format

# Clean build artifacts
make clean
```

## Configuration

The application reads configuration from environment variables (loaded from `config/.env`):

- `APP_PORT`: Server port (default: 8080)
- `APP_LOG_LEVEL`: Log level (default: info)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: Database connection details
- `DB_MAX_CONNS`: Maximum database connections (default: 8)
- `DB_MAX_CONN_LIFETIME`: Connection lifetime (default: 30s)

- `OLLAMA_SERVER_ADDRESS`: Ollama server URL (default: http://127.0.0.1:11434)
- `OLLAMA_MODEL`: Model name, e.g. llama3.2, gemma2 (default: llama3.2)
- `OLLAMA_TIMEOUT`: Response timeout in seconds (default: 60)

