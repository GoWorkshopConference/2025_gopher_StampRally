package usecase

import (
	"context"
	"errors"

	"2025_gopher_StampRally/services/gopher-stamp-crud/internal/domain/entity"
	"2025_gopher_StampRally/services/gopher-stamp-crud/internal/domain/repository"

	"gorm.io/gorm"
)

type StampUseCase interface {
	ListStamps(ctx context.Context, limit, offset int) ([]entity.Stamp, int64, error)
	GetStamp(ctx context.Context, id uint) (*entity.Stamp, error)
	CreateStamp(ctx context.Context, name string) (*entity.Stamp, error)
	UpdateStamp(ctx context.Context, id uint, name *string) (*entity.Stamp, error)
	DeleteStamp(ctx context.Context, id uint) error
}

type stampUseCase struct {
	stampRepo repository.StampRepository
}

func NewStampUseCase(stampRepo repository.StampRepository) StampUseCase {
	return &stampUseCase{
		stampRepo: stampRepo,
	}
}

func (uc *stampUseCase) ListStamps(ctx context.Context, limit, offset int) ([]entity.Stamp, int64, error) {
	stamps, err := uc.stampRepo.FindAll(ctx, limit, offset)
	if err != nil {
		return nil, 0, err
	}

	total, err := uc.stampRepo.Count(ctx)
	if err != nil {
		return nil, 0, err
	}

	return stamps, total, nil
}

func (uc *stampUseCase) GetStamp(ctx context.Context, id uint) (*entity.Stamp, error) {
	stamp, err := uc.stampRepo.FindByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("stamp not found")
		}
		return nil, err
	}
	return stamp, nil
}

func (uc *stampUseCase) CreateStamp(ctx context.Context, name string) (*entity.Stamp, error) {
	stamp := &entity.Stamp{
		Name: name,
	}

	if err := uc.stampRepo.Create(ctx, stamp); err != nil {
		return nil, err
	}

	return stamp, nil
}

func (uc *stampUseCase) UpdateStamp(ctx context.Context, id uint, name *string) (*entity.Stamp, error) {
	// バリデーション: nameがnilの場合はエラー
	if name == nil {
		return nil, errors.New("name must be provided")
	}

	stamp, err := uc.stampRepo.FindByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("stamp not found")
		}
		return nil, err
	}

	stamp.Name = *name

	if err := uc.stampRepo.Update(ctx, stamp); err != nil {
		return nil, err
	}

	return stamp, nil
}

func (uc *stampUseCase) DeleteStamp(ctx context.Context, id uint) error {
	// Check if stamp exists
	_, err := uc.stampRepo.FindByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("stamp not found")
		}
		return err
	}

	return uc.stampRepo.Delete(ctx, id)
}
