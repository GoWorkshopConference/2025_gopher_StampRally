//go:build wireinject
// +build wireinject

package wire_server

import (
	"2025_gopher_StampRally/services/gopher-stamp-crud/internal/domain/repository"
	"2025_gopher_StampRally/services/gopher-stamp-crud/internal/infrastructure/mysql"
	"2025_gopher_StampRally/services/gopher-stamp-crud/internal/interface/handler"
	"2025_gopher_StampRally/services/gopher-stamp-crud/internal/usecase"
	openapi "2025_gopher_StampRally/services/gopher-stamp-crud/swagger"

	"github.com/gin-gonic/gin"
	"github.com/google/wire"
	"gorm.io/gorm"
)

// ProviderSet is the set of providers for dependency injection
var ProviderSet = wire.NewSet(
	// Infrastructure
	mysql.NewMySQLClient,
	NewUserRepository,

	// Usecase
	usecase.NewUserUsecase,

	// Handler
	handler.NewUserHandler,
)

// NewUserRepository creates a UserRepository interface from mysql implementation
func NewUserRepository(db *gorm.DB) repository.UserRepository {
	return mysql.NewUserRepository(db)
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
	openapi.RegisterHandlers(r, h)
	return r
}
