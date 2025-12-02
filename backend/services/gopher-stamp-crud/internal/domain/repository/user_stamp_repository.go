package repository

import (
	"context"

	"2025_gopher_StampRally/services/gopher-stamp-crud/internal/domain/entity"
)

type UserStampRepository interface {
	FindByUserID(ctx context.Context, userID uint) ([]entity.UserStamp, error)
	Create(ctx context.Context, userStamp *entity.UserStamp) error
	ExistsByUserIDAndStampID(ctx context.Context, userID, stampID uint) (bool, error)
}
