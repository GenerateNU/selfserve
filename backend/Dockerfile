# Build stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install make
RUN apk add --no-cache make

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source
COPY . .

# Build using Makefile
RUN make build

# Run stage
FROM alpine:latest

WORKDIR /app

# Copy the binary from the builder stage
# Makefile builds to bin/selfserve
COPY --from=builder /app/bin/selfserve .

# Expose port 8080
EXPOSE 8080

# Command to run the executable
CMD ["./selfserve"]
