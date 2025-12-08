//go:build wireinject

package wire_server

import (
	"os"

	"2025_gopher_StampRally/services/gopher-stamp-crud/internal/domain/repository"
	"2025_gopher_StampRally/services/gopher-stamp-crud/internal/infrastructure/mysql"
	"2025_gopher_StampRally/services/gopher-stamp-crud/internal/interface/handler"
	"2025_gopher_StampRally/services/gopher-stamp-crud/internal/usecase"
	openapi "2025_gopher_StampRally/services/gopher-stamp-crud/swagger"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/google/wire"
	"gorm.io/gorm"
)

// ProviderSet is the set of providers for dependency injection
var ProviderSet = wire.NewSet(
	// Infrastructure
	mysql.NewMySQLClient,
	NewUserRepository,
	NewStampRepository,
	NewUserStampRepository,

	// Usecase
	usecase.NewUserUsecase,
	usecase.NewStampUseCase,
	usecase.NewUserStampUseCase,

	// Handler
	handler.NewStampHandler,
	handler.NewUserStampHandler,
	handler.NewUserHandler,
)

// NewUserRepository creates a UserRepository interface from mysql implementation
func NewUserRepository(db *gorm.DB) repository.UserRepository {
	return mysql.NewUserRepository(db)
}

// NewStampRepository creates a StampRepository interface from mysql implementation
func NewStampRepository(db *gorm.DB) repository.StampRepository {
	return mysql.NewStampRepository(db)
}

// NewUserStampRepository creates a UserStampRepository interface from mysql implementation
func NewUserStampRepository(db *gorm.DB) repository.UserStampRepository {
	return mysql.NewUserStampRepository(db)
}

// InitializeServer initializes all dependencies and returns a gin.Engine
func InitializeServer() (*gin.Engine, error) {
	wire.Build(
		ProviderSet,
		NewGinEngine,
	)
	return nil, nil
}

// NewGinEngine creates a new gin.Engine with handlers registered
func NewGinEngine(h openapi.ServerInterface) *gin.Engine {
	r := gin.Default()

	// CORS settings: allow frontend origin
	// Get allowed origin from environment variable, default to production frontend URL
	allowedOrigin := os.Getenv("CORS_ALLOWED_ORIGIN")
	corsConfig := cors.Config{
		AllowOrigins:     []string{allowedOrigin},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * 60 * 60, // 12 hours
	}
	r.Use(cors.New(corsConfig))

	// Debug: log CORS configuration (remove in production if needed)
	gin.SetMode(gin.ReleaseMode) // Set to release mode to reduce logs

	// Health check endpoint (supports both GET and HEAD for Docker healthcheck)
	healthHandler := func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	}
	r.GET("/health", healthHandler)
	r.HEAD("/health", healthHandler)

	// Get baseURL from environment variable, default to empty string if not set
	baseURL := os.Getenv("BASE_API_URL")
	options := openapi.GinServerOptions{
		BaseURL: baseURL,
	}
	openapi.RegisterHandlersWithOptions(r, h, options)
	return r
}
