package repository

import "2025_gopher_StampRally/services/gopher-stamp-crud/internal/domain/entity"

type UserRepository interface {
	Create(user *entity.User) error
	FindByID(id uint) (*entity.User, error)
	FindAll() ([]*entity.User, error)
	Update(user *entity.User) error
	Delete(id uint) error
}
