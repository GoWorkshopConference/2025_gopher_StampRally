package handler

import (
	"net/http"

	"2025_gopher_StampRally/services/gopher-stamp-crud/internal/usecase"
	openapi "2025_gopher_StampRally/services/gopher-stamp-crud/swagger"

	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	userUsecase usecase.UserUsecase
}

func NewUserHandler(userUsecase usecase.UserUsecase) openapi.ServerInterface {
	return &UserHandler{userUsecase: userUsecase}
}

// (POST /users) Swagger生成のインターフェースに合わせたメソッド
func (h *UserHandler) CreateUser(c *gin.Context) {
	var request openapi.CreateUserRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, openapi.ErrorResponse{Error: err.Error()})
		return
	}

	user, err := h.userUsecase.Create(request.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, openapi.ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusCreated, openapi.User{
		Id:   uint64(user.ID),
		Name: user.Name,
	})
}

// (GET /users/{id}) Swagger生成のインターフェースに合わせたメソッド
func (h *UserHandler) GetUser(c *gin.Context, id uint64) {

	user, err := h.userUsecase.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, openapi.ErrorResponse{Error: "user not found"})
		return
	}

	c.JSON(http.StatusOK, openapi.User{
		Id:   uint64(user.ID),
		Name: user.Name,
	})
}

// (GET /users) Swagger生成のインターフェースに合わせたメソッド
func (h *UserHandler) ListUsers(c *gin.Context) {
	users, err := h.userUsecase.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, openapi.ErrorResponse{Error: err.Error()})
		return
	}

	swaggerUsers := make([]openapi.User, len(users))
	for i, user := range users {
		swaggerUsers[i] = openapi.User{
			Id:   uint64(user.ID),
			Name: user.Name,
		}
	}

	c.JSON(http.StatusOK, swaggerUsers)
}

// (PUT /users/{id}) Swagger生成のインターフェースに合わせたメソッド
func (h *UserHandler) UpdateUser(c *gin.Context, id uint64) {

	var request openapi.UpdateUserRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, openapi.ErrorResponse{Error: err.Error()})
		return
	}

	user, err := h.userUsecase.Update(uint(id), request.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, openapi.ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, openapi.User{
		Id:   uint64(user.ID),
		Name: user.Name,
	})
}

// (DELETE /users/{id}) Swagger生成のインターフェースに合わせたメソッド
func (h *UserHandler) DeleteUser(c *gin.Context, id uint64) {

	if err := h.userUsecase.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, openapi.ErrorResponse{Error: err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}
