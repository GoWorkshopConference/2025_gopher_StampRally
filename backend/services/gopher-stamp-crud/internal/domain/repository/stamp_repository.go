package repository

import (
	"context"

	"2025_gopher_StampRally/services/gopher-stamp-crud/internal/domain/entity"
)

type StampRepository interface {
	FindAll(ctx context.Context, limit, offset int) ([]entity.Stamp, error)
	FindByID(ctx context.Context, id uint) (*entity.Stamp, error)
	Create(ctx context.Context, stamp *entity.Stamp) error
	Update(ctx context.Context, stamp *entity.Stamp) error
	Delete(ctx context.Context, id uint) error
	Count(ctx context.Context) (int64, error)
}
