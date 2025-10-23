package usecase

import (
	"2025_gopher_StampRally/services/gopher-stamp-crud/internal/domain/entity"
	"2025_gopher_StampRally/services/gopher-stamp-crud/internal/domain/repository"
)

type UserUsecase interface {
	Create(name string) (*entity.User, error)
	GetByID(id uint) (*entity.User, error)
	GetAll() ([]*entity.User, error)
	Update(id uint, name string) (*entity.User, error)
	Delete(id uint) error
}

type userUsecase struct {
	userRepo repository.UserRepository
}

func NewUserUsecase(userRepo repository.UserRepository) UserUsecase {
	return &userUsecase{userRepo: userRepo}
}

func (u *userUsecase) Create(name string) (*entity.User, error) {
	user := &entity.User{
		Name: name,
	}
	if err := u.userRepo.Create(user); err != nil {
		return nil, err
	}
	return user, nil
}

func (u *userUsecase) GetByID(id uint) (*entity.User, error) {
	return u.userRepo.FindByID(id)
}

func (u *userUsecase) GetAll() ([]*entity.User, error) {
	return u.userRepo.FindAll()
}

func (u *userUsecase) Update(id uint, name string) (*entity.User, error) {
	user, err := u.userRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	user.Name = name
	if err := u.userRepo.Update(user); err != nil {
		return nil, err
	}
	return user, nil
}

func (u *userUsecase) Delete(id uint) error {
	return u.userRepo.Delete(id)
}
