package mysql

import (
	"context"

	"2025_gopher_StampRally/services/gopher-stamp-crud/internal/domain/entity"
	"2025_gopher_StampRally/services/gopher-stamp-crud/internal/domain/repository"

	"gorm.io/gorm"
)

type stampRepository struct {
	db *gorm.DB
}

func NewStampRepository(db *gorm.DB) repository.StampRepository {
	return &stampRepository{db: db}
}

func (r *stampRepository) FindAll(ctx context.Context, limit, offset int) ([]entity.Stamp, error) {
	var stamps []entity.Stamp
	err := r.db.WithContext(ctx).Limit(limit).Offset(offset).Find(&stamps).Error
	return stamps, err
}

func (r *stampRepository) FindByID(ctx context.Context, id uint) (*entity.Stamp, error) {
	var stamp entity.Stamp
	err := r.db.WithContext(ctx).First(&stamp, id).Error
	if err != nil {
		return nil, err
	}
	return &stamp, nil
}

func (r *stampRepository) Create(ctx context.Context, stamp *entity.Stamp) error {
	return r.db.WithContext(ctx).Create(stamp).Error
}

func (r *stampRepository) Update(ctx context.Context, stamp *entity.Stamp) error {
	return r.db.WithContext(ctx).Save(stamp).Error
}

func (r *stampRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&entity.Stamp{}, id).Error
}

func (r *stampRepository) Count(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&entity.Stamp{}).Count(&count).Error
	return count, err
}
