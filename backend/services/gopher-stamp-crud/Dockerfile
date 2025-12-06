# Build stage
FROM golang:1.24-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git ca-certificates tzdata

# Set working directory
WORKDIR /build

# Copy go mod files first for better layer caching
# Railway uses repo root as build context
COPY backend/services/gopher-stamp-crud/go.mod backend/services/gopher-stamp-crud/go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY backend/services/gopher-stamp-crud/ ./

# Resolve and download all dependencies (including missing ones)
RUN go mod tidy && go mod download

# Build the application
# -ldflags='-w -s' reduces binary size by removing debug info
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags='-w -s' \
    -installsuffix cgo \
    -o /app/main \
    ./cmd/server

# Final stage
FROM alpine:latest

# Install runtime dependencies
RUN apk --no-cache add ca-certificates tzdata

# Create non-root user
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser

# Set working directory
WORKDIR /app

# Copy binary from builder stage
COPY --from=builder --chown=appuser:appuser /app/main .

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Run the application
CMD ["./main"]
