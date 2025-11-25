package handler

import (
	"net/http"
	"strconv"

	"2025_gopher_StampRally/services/gopher-stamp-crud/internal/usecase"
	openapi "2025_gopher_StampRally/services/gopher-stamp-crud/swagger"

	"github.com/gin-gonic/gin"
)

type StampHandler struct {
	stampUseCase usecase.StampUseCase
}

func NewStampHandler(stampUseCase usecase.StampUseCase) *StampHandler {
	return &StampHandler{
		stampUseCase: stampUseCase,
	}
}

// ListStamps implements openapi.ServerInterface
func (h *StampHandler) ListStamps(c *gin.Context, params openapi.ListStampsParams) {
	limit := 100
	offset := 0

	if params.Limit != nil {
		limit = *params.Limit
	}
	if params.Offset != nil {
		offset = *params.Offset
	}

	stamps, total, err := h.stampUseCase.ListStamps(c.Request.Context(), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, openapi.Error{
			Code:    "INTERNAL_ERROR",
			Message: "Failed to fetch stamps",
		})
		return
	}

	// Convert entity to openapi types
	response := make([]openapi.Stamp, len(stamps))
	for i, stamp := range stamps {
		response[i] = openapi.Stamp{
			Id:        int64(stamp.ID),
			Name:      stamp.Name,
			Image:     stamp.Image,
			CreatedAt: &stamp.CreatedAt,
			UpdatedAt: &stamp.UpdatedAt,
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"stamps": response,
		"total":  total,
	})
}

// CreateStamp implements openapi.ServerInterface
func (h *StampHandler) CreateStamp(c *gin.Context) {
	var req openapi.StampCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		errMsg := err.Error()
		c.JSON(http.StatusBadRequest, openapi.Error{
			Code:    "INVALID_REQUEST",
			Message: "Invalid request body",
			Details: &errMsg,
		})
		return
	}

	stamp, err := h.stampUseCase.CreateStamp(c.Request.Context(), req.Name, req.Image)
	if err != nil {
		c.JSON(http.StatusInternalServerError, openapi.Error{
			Code:    "INTERNAL_ERROR",
			Message: "Failed to create stamp",
		})
		return
	}

	response := openapi.Stamp{
		Id:        int64(stamp.ID),
		Name:      stamp.Name,
		Image:     stamp.Image,
		CreatedAt: &stamp.CreatedAt,
		UpdatedAt: &stamp.UpdatedAt,
	}

	c.JSON(http.StatusCreated, response)
}

// GetStamp implements openapi.ServerInterface
func (h *StampHandler) GetStamp(c *gin.Context, id int64) {
	stamp, err := h.stampUseCase.GetStamp(c.Request.Context(), uint(id))
	if err != nil {
		if err.Error() == "stamp not found" {
			c.JSON(http.StatusNotFound, openapi.Error{
				Code:    "NOT_FOUND",
				Message: "Stamp not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, openapi.Error{
			Code:    "INTERNAL_ERROR",
			Message: "Failed to fetch stamp",
		})
		return
	}

	response := openapi.Stamp{
		Id:        int64(stamp.ID),
		Name:      stamp.Name,
		Image:     stamp.Image,
		CreatedAt: &stamp.CreatedAt,
		UpdatedAt: &stamp.UpdatedAt,
	}

	c.JSON(http.StatusOK, response)
}

// UpdateStamp implements openapi.ServerInterface
func (h *StampHandler) UpdateStamp(c *gin.Context, id int64) {
	var req openapi.StampUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		errMsg := err.Error()
		c.JSON(http.StatusBadRequest, openapi.Error{
			Code:    "INVALID_REQUEST",
			Message: "Invalid request body",
			Details: &errMsg,
		})
		return
	}

	stamp, err := h.stampUseCase.UpdateStamp(c.Request.Context(), uint(id), req.Name, req.Image)
	if err != nil {
		if err.Error() == "stamp not found" {
			c.JSON(http.StatusNotFound, openapi.Error{
				Code:    "NOT_FOUND",
				Message: "Stamp not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, openapi.Error{
			Code:    "INTERNAL_ERROR",
			Message: "Failed to update stamp",
		})
		return
	}

	response := openapi.Stamp{
		Id:        int64(stamp.ID),
		Name:      stamp.Name,
		Image:     stamp.Image,
		CreatedAt: &stamp.CreatedAt,
		UpdatedAt: &stamp.UpdatedAt,
	}

	c.JSON(http.StatusOK, response)
}

// DeleteStamp implements openapi.ServerInterface
func (h *StampHandler) DeleteStamp(c *gin.Context, id int64) {
	err := h.stampUseCase.DeleteStamp(c.Request.Context(), uint(id))
	if err != nil {
		if err.Error() == "stamp not found" {
			c.JSON(http.StatusNotFound, openapi.Error{
				Code:    "NOT_FOUND",
				Message: "Stamp not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, openapi.Error{
			Code:    "INTERNAL_ERROR",
			Message: "Failed to delete stamp",
		})
		return
	}

	c.Status(http.StatusNoContent)
}

// Helper function to convert ID from string to int64
func parseID(c *gin.Context, paramName string) (int64, error) {
	idStr := c.Param(paramName)
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		return 0, err
	}
	return id, nil
}
