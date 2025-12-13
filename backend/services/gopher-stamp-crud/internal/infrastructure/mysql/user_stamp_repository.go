package mysql

import (
	"context"

	"2025_gopher_StampRally/services/gopher-stamp-crud/internal/domain/entity"
	"2025_gopher_StampRally/services/gopher-stamp-crud/internal/domain/repository"

	"gorm.io/gorm"
)

type userStampRepository struct {
	db *gorm.DB
}

func NewUserStampRepository(db *gorm.DB) repository.UserStampRepository {
	return &userStampRepository{db: db}
}

func (r *userStampRepository) FindByUserID(ctx context.Context, userID uint) ([]entity.UserStamp, error) {
	var userStamps []entity.UserStamp
	err := r.db.WithContext(ctx).
		Preload("Stamp").
		Where("user_id = ?", userID).
		Find(&userStamps).Error
	return userStamps, err
}

func (r *userStampRepository) Create(ctx context.Context, userStamp *entity.UserStamp) error {
	return r.db.WithContext(ctx).Create(userStamp).Error
}

func (r *userStampRepository) ExistsByUserIDAndStampID(ctx context.Context, userID, stampID uint) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&entity.UserStamp{}).
		Where("user_id = ? AND stamp_id = ?", userID, stampID).
		Count(&count).Error
	return count > 0, err
}

func (r *userStampRepository) FindAllUserStampIDs(ctx context.Context) (map[uint][]uint, error) {
	var results []struct {
		UserID  uint
		StampID uint
	}

	err := r.db.WithContext(ctx).
		Model(&entity.UserStamp{}).
		Select("user_id, stamp_id").
		Find(&results).Error

	if err != nil {
		return nil, err
	}

	userStampMap := make(map[uint][]uint)
	for _, result := range results {
		userStampMap[result.UserID] = append(userStampMap[result.UserID], result.StampID)
	}

	return userStampMap, nil
}
