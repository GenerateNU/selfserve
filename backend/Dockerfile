# Build stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install make
RUN apk add --no-cache make

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Install swag for generating swagger docs
RUN go install github.com/swaggo/swag/cmd/swag@latest

# Copy the source
COPY . .

# Build using Makefile
RUN make build

# Run stage
FROM alpine:latest

WORKDIR /app

# Install Doppler CLI
RUN apk add --no-cache curl gnupg && \
    curl -Ls https://cli.doppler.com/install.sh | sh

# Copy the binary from the builder stage
# Makefile builds to bin/selfserve
COPY --from=builder /app/bin/selfserve .

# Expose port 8080
EXPOSE 8080

# Doppler fetches secrets at runtime — DOPPLER_TOKEN must be set
CMD ["doppler", "run", "--", "./selfserve"]
