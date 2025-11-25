package handler

import (
	"net/http"

	"2025_gopher_StampRally/services/gopher-stamp-crud/internal/usecase"
	openapi "2025_gopher_StampRally/services/gopher-stamp-crud/swagger"

	"github.com/gin-gonic/gin"
)

type UserStampHandler struct {
	userStampUseCase usecase.UserStampUseCase
}

func NewUserStampHandler(userStampUseCase usecase.UserStampUseCase) *UserStampHandler {
	return &UserStampHandler{
		userStampUseCase: userStampUseCase,
	}
}

// ListUserStamps implements openapi.ServerInterface
func (h *UserStampHandler) ListUserStamps(c *gin.Context, id int64) {
	userStamps, err := h.userStampUseCase.ListUserStamps(c.Request.Context(), uint(id))
	if err != nil {
		if err.Error() == "user not found" {
			c.JSON(http.StatusNotFound, openapi.Error{
				Code:    "NOT_FOUND",
				Message: "User not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, openapi.Error{
			Code:    "INTERNAL_ERROR",
			Message: "Failed to fetch user stamps",
		})
		return
	}

	// Convert entity to openapi types
	response := make([]openapi.UserStamp, len(userStamps))
	for i, userStamp := range userStamps {
		response[i] = openapi.UserStamp{
			UserId:     int64(userStamp.UserID),
			StampId:    int64(userStamp.StampID),
			AcquiredAt: &userStamp.AcquiredAt,
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"stamps": response,
	})
}

// AcquireStamp implements openapi.ServerInterface
func (h *UserStampHandler) AcquireStamp(c *gin.Context, id int64) {
	var req openapi.AcquireStampRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		errMsg := err.Error()
		c.JSON(http.StatusBadRequest, openapi.Error{
			Code:    "INVALID_REQUEST",
			Message: "Invalid request body",
			Details: &errMsg,
		})
		return
	}

	userStamp, err := h.userStampUseCase.AcquireStamp(c.Request.Context(), uint(id), uint(req.StampId))
	if err != nil {
		switch err.Error() {
		case "user not found", "stamp not found":
			c.JSON(http.StatusNotFound, openapi.Error{
				Code:    "NOT_FOUND",
				Message: err.Error(),
			})
			return
		case "stamp already acquired":
			c.JSON(http.StatusConflict, openapi.Error{
				Code:    "ALREADY_EXISTS",
				Message: "Stamp already acquired",
			})
			return
		default:
			c.JSON(http.StatusInternalServerError, openapi.Error{
				Code:    "INTERNAL_ERROR",
				Message: "Failed to acquire stamp",
			})
			return
		}
	}

	response := openapi.UserStamp{
		UserId:     int64(userStamp.UserID),
		StampId:    int64(userStamp.StampID),
		AcquiredAt: &userStamp.AcquiredAt,
	}

	c.JSON(http.StatusCreated, response)
}
