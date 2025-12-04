package handler

import (
	"net/http"

	"2025_gopher_StampRally/services/gopher-stamp-crud/internal/usecase"
	openapi "2025_gopher_StampRally/services/gopher-stamp-crud/swagger"

	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	userUsecase      usecase.UserUsecase
	userStampUseCase usecase.UserStampUseCase
	stampHandler     *StampHandler
	userStampHandler *UserStampHandler
}

func NewUserHandler(
	userUsecase usecase.UserUsecase,
	userStampUseCase usecase.UserStampUseCase,
	stampHandler *StampHandler,
	userStampHandler *UserStampHandler,
) openapi.ServerInterface {
	return &UserHandler{
		userUsecase:      userUsecase,
		userStampUseCase: userStampUseCase,
		stampHandler:     stampHandler,
		userStampHandler: userStampHandler,
	}
}

// (POST /users) Swagger生成のインターフェースに合わせたメソッド
func (h *UserHandler) CreateUser(c *gin.Context) {
	var request openapi.UserCreateRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		errMsg := err.Error()
		c.JSON(http.StatusBadRequest, openapi.Error{
			Code:    "INVALID_REQUEST",
			Message: "Invalid request body",
			Details: &errMsg,
		})
		return
	}

	user, err := h.userUsecase.Create(
		c.Request.Context(),
		request.Name,
		request.TwitterId,
		request.FavoriteGoFeature,
		request.Icon,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, openapi.Error{
			Code:    "INTERNAL_ERROR",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, openapi.User{
		Id:                int64(user.ID),
		Name:              user.Name,
		TwitterId:         user.TwitterID,
		FavoriteGoFeature: user.FavoriteGoFeature,
		Icon:              user.Icon,
		CreatedAt:         &user.CreatedAt,
		UpdatedAt:         &user.UpdatedAt,
	})
}

// (GET /users/{id}) Swagger生成のインターフェースに合わせたメソッド
func (h *UserHandler) GetUser(c *gin.Context, id int64) {
	ctx := c.Request.Context()

	user, err := h.userUsecase.GetByID(ctx, uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, openapi.Error{
			Code:    "NOT_FOUND",
			Message: "user not found",
		})
		return
	}

	// Get user stamps
	userStamps, err := h.userStampUseCase.ListUserStamps(ctx, uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, openapi.Error{
			Code:    "INTERNAL_ERROR",
			Message: "Failed to fetch user stamps",
		})
		return
	}

	// Convert to openapi.UserStamp
	acquiredStamps := make([]openapi.UserStamp, len(userStamps))
	for i, us := range userStamps {
		acquiredStamps[i] = openapi.UserStamp{
			UserId:     int64(us.UserID),
			StampId:    int64(us.StampID),
			AcquiredAt: &us.AcquiredAt,
		}
	}

	c.JSON(http.StatusOK, openapi.UserDetail{
		Id:                int64(user.ID),
		Name:              user.Name,
		TwitterId:         user.TwitterID,
		FavoriteGoFeature: user.FavoriteGoFeature,
		Icon:              user.Icon,
		CreatedAt:         &user.CreatedAt,
		UpdatedAt:         &user.UpdatedAt,
		AcquiredStamps:    &acquiredStamps,
	})
}

// (GET /users) Swagger生成のインターフェースに合わせたメソッド
func (h *UserHandler) ListUsers(c *gin.Context) {
	users, err := h.userUsecase.GetAll(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, openapi.Error{
			Code:    "INTERNAL_ERROR",
			Message: err.Error(),
		})
		return
	}

	swaggerUsers := make([]openapi.User, len(users))
	for i, user := range users {
		swaggerUsers[i] = openapi.User{
			Id:                int64(user.ID),
			Name:              user.Name,
			TwitterId:         user.TwitterID,
			FavoriteGoFeature: user.FavoriteGoFeature,
			Icon:              user.Icon,
			CreatedAt:         &user.CreatedAt,
			UpdatedAt:         &user.UpdatedAt,
		}
	}

	c.JSON(http.StatusOK, swaggerUsers)
}

// (PUT /users/{id}) Swagger生成のインターフェースに合わせたメソッド
func (h *UserHandler) UpdateUser(c *gin.Context, id int64) {
	var request openapi.UserUpdateRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		errMsg := err.Error()
		c.JSON(http.StatusBadRequest, openapi.Error{
			Code:    "INVALID_REQUEST",
			Message: "Invalid request body",
			Details: &errMsg,
		})
		return
	}

	// At least one field must be provided
	if request.Name == nil && request.TwitterId == nil && request.FavoriteGoFeature == nil && request.Icon == nil {
		c.JSON(http.StatusBadRequest, openapi.Error{
			Code:    "INVALID_REQUEST",
			Message: "At least one field must be provided",
		})
		return
	}

	user, err := h.userUsecase.Update(
		c.Request.Context(),
		uint(id),
		request.Name,
		request.TwitterId,
		request.FavoriteGoFeature,
		request.Icon,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, openapi.Error{
			Code:    "INTERNAL_ERROR",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, openapi.User{
		Id:                int64(user.ID),
		Name:              user.Name,
		TwitterId:         user.TwitterID,
		FavoriteGoFeature: user.FavoriteGoFeature,
		Icon:              user.Icon,
		CreatedAt:         &user.CreatedAt,
		UpdatedAt:         &user.UpdatedAt,
	})
}

// Delegate stamp methods to StampHandler
func (h *UserHandler) ListStamps(c *gin.Context, params openapi.ListStampsParams) {
	h.stampHandler.ListStamps(c, params)
}

func (h *UserHandler) CreateStamp(c *gin.Context) {
	h.stampHandler.CreateStamp(c)
}

func (h *UserHandler) GetStamp(c *gin.Context, id int64) {
	h.stampHandler.GetStamp(c, id)
}

func (h *UserHandler) UpdateStamp(c *gin.Context, id int64) {
	h.stampHandler.UpdateStamp(c, id)
}

func (h *UserHandler) DeleteStamp(c *gin.Context, id int64) {
	h.stampHandler.DeleteStamp(c, id)
}

func (h *UserHandler) GetStampOTP(c *gin.Context, id int64) {
	h.stampHandler.GetStampOTP(c, id)
}

// Delegate user stamp methods to UserStampHandler
func (h *UserHandler) ListUserStamps(c *gin.Context, id int64) {
	h.userStampHandler.ListUserStamps(c, id)
}

func (h *UserHandler) AcquireStamp(c *gin.Context, id int64) {
	h.userStampHandler.AcquireStamp(c, id)
}
