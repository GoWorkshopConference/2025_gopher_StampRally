package handler

import (
	"crypto/sha256"
	"encoding/binary"
	"fmt"
	"net/http"
	"time"

	"2025_gopher_StampRally/services/gopher-stamp-crud/internal/usecase"
	openapi "2025_gopher_StampRally/services/gopher-stamp-crud/swagger"

	"github.com/gin-gonic/gin"
)

// generateOTP generates a 4-digit OTP based on the secret key and current time (1-minute window)
func generateOTP(secretKey string, t time.Time) string {
	// Round down to the nearest minute
	timestamp := t.Truncate(time.Minute).Unix()

	// Create a buffer for the timestamp
	buf := make([]byte, 8)
	binary.BigEndian.PutUint64(buf, uint64(timestamp))

	// Combine secret key and timestamp
	data := append([]byte(secretKey), buf...)

	// Hash the data
	hash := sha256.Sum256(data)

	// Take the first 4 bytes and convert to a number
	offset := hash[len(hash)-1] & 0x0f
	binaryCode := int(hash[offset]&0x7f)<<24 |
		int(hash[offset+1]&0xff)<<16 |
		int(hash[offset+2]&0xff)<<8 |
		int(hash[offset+3]&0xff)

	// Generate 4-digit code
	otp := binaryCode % 10000
	return fmt.Sprintf("%04d", otp)
}

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
			Id:   int64(stamp.ID),
			Name: stamp.Name,
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

	stamp, err := h.stampUseCase.CreateStamp(c.Request.Context(), req.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, openapi.Error{
			Code:    "INTERNAL_ERROR",
			Message: "Failed to create stamp",
		})
		return
	}

	response := openapi.Stamp{
		Id:   int64(stamp.ID),
		Name: stamp.Name,
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
		Id:   int64(stamp.ID),
		Name: stamp.Name,
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

	stamp, err := h.stampUseCase.UpdateStamp(c.Request.Context(), uint(id), req.Name)
	if err != nil {
		if err.Error() == "stamp not found" {
			c.JSON(http.StatusNotFound, openapi.Error{
				Code:    "NOT_FOUND",
				Message: "Stamp not found",
			})
			return
		}
		if err.Error() == "name must be provided" {
			errMsg := err.Error()
			c.JSON(http.StatusBadRequest, openapi.Error{
				Code:    "INVALID_REQUEST",
				Message: "name must be provided",
				Details: &errMsg,
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
		Id:   int64(stamp.ID),
		Name: stamp.Name,
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

// GetStampOTP implements openapi.ServerInterface
func (h *StampHandler) GetStampOTP(c *gin.Context, id int64) {
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

	// Generate OTP
	otp := generateOTP(stamp.SecretKey, time.Now())

	c.JSON(http.StatusOK, gin.H{
		"otp": otp,
	})
}
