package main

import (
	"log"

	"2025_gopher_StampRally/services/gopher-stamp-crud/cmd/wire_server"
)

func main() {
	// Initialize server with Wire dependency injection
	r, err := wire_server.InitializeServer()
	if err != nil {
		log.Fatalf("Failed to initialize server: %v", err)
	}

	// Start server
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
