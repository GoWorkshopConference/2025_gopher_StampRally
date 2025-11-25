package usecase

import (
	"context"

	"2025_gopher_StampRally/services/gopher-stamp-crud/internal/domain/entity"
	"2025_gopher_StampRally/services/gopher-stamp-crud/internal/domain/repository"
)

type UserUsecase interface {
	Create(ctx context.Context, name string) (*entity.User, error)
	GetByID(ctx context.Context, id uint) (*entity.User, error)
	GetAll(ctx context.Context) ([]*entity.User, error)
	Update(ctx context.Context, id uint, name string) (*entity.User, error)
	Delete(ctx context.Context, id uint) error
}

type userUsecase struct {
	userRepo repository.UserRepository
}

func NewUserUsecase(userRepo repository.UserRepository) UserUsecase {
	return &userUsecase{userRepo: userRepo}
}

func (u *userUsecase) Create(ctx context.Context, name string) (*entity.User, error) {
	user := &entity.User{
		Name: name,
	}
	if err := u.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}

func (u *userUsecase) GetByID(ctx context.Context, id uint) (*entity.User, error) {
	return u.userRepo.FindByID(ctx, id)
}

func (u *userUsecase) GetAll(ctx context.Context) ([]*entity.User, error) {
	return u.userRepo.FindAll(ctx)
}

func (u *userUsecase) Update(ctx context.Context, id uint, name string) (*entity.User, error) {
	user, err := u.userRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	user.Name = name
	if err := u.userRepo.Update(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}

func (u *userUsecase) Delete(ctx context.Context, id uint) error {
	return u.userRepo.Delete(ctx, id)
}
