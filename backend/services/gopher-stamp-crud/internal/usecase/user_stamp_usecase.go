package usecase

import (
	"context"
	"errors"

	"2025_gopher_StampRally/services/gopher-stamp-crud/internal/domain/entity"
	"2025_gopher_StampRally/services/gopher-stamp-crud/internal/domain/repository"

	"gorm.io/gorm"
)

type UserStampUseCase interface {
	ListUserStamps(ctx context.Context, userID uint) ([]entity.UserStamp, error)
	AcquireStamp(ctx context.Context, userID, stampID uint) (*entity.UserStamp, error)
}

type userStampUseCase struct {
	userStampRepo repository.UserStampRepository
	userRepo      repository.UserRepository
	stampRepo     repository.StampRepository
}

func NewUserStampUseCase(
	userStampRepo repository.UserStampRepository,
	userRepo repository.UserRepository,
	stampRepo repository.StampRepository,
) UserStampUseCase {
	return &userStampUseCase{
		userStampRepo: userStampRepo,
		userRepo:      userRepo,
		stampRepo:     stampRepo,
	}
}

func (uc *userStampUseCase) ListUserStamps(ctx context.Context, userID uint) ([]entity.UserStamp, error) {
	// Check if user exists
	_, err := uc.userRepo.FindByID(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	userStamps, err := uc.userStampRepo.FindByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	return userStamps, nil
}

func (uc *userStampUseCase) AcquireStamp(ctx context.Context, userID, stampID uint) (*entity.UserStamp, error) {
	// Check if user exists
	_, err := uc.userRepo.FindByID(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	// Check if stamp exists
	_, err = uc.stampRepo.FindByID(ctx, stampID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("stamp not found")
		}
		return nil, err
	}

	// Check if already acquired
	exists, err := uc.userStampRepo.ExistsByUserIDAndStampID(ctx, userID, stampID)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("stamp already acquired")
	}

	// Create user stamp
	userStamp := &entity.UserStamp{
		UserID:  userID,
		StampID: stampID,
	}

	if err := uc.userStampRepo.Create(ctx, userStamp); err != nil {
		return nil, err
	}

	// Reload with associations
	userStamps, err := uc.userStampRepo.FindByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	// Find the newly created stamp
	for _, us := range userStamps {
		if us.StampID == stampID {
			return &us, nil
		}
	}

	return userStamp, nil
}
