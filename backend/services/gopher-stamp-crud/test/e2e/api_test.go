package e2e

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const (
	baseURL = "http://localhost:8080"
)

// Helper functions

func makeRequest(t *testing.T, method, path string, body interface{}) (*http.Response, []byte) {
	var reqBody io.Reader
	if body != nil {
		jsonData, err := json.Marshal(body)
		require.NoError(t, err)
		reqBody = bytes.NewBuffer(jsonData)
	}

	req, err := http.NewRequest(method, baseURL+path, reqBody)
	require.NoError(t, err)

	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	require.NoError(t, err)

	defer resp.Body.Close()
	respBody, err := io.ReadAll(resp.Body)
	require.NoError(t, err)

	return resp, respBody
}

// Test Data Structures

type User struct {
	ID   int64  `json:"id"`
	Name string `json:"name"`
}

type UserDetail struct {
	ID             int64       `json:"id"`
	Name           string      `json:"name"`
	AcquiredStamps []UserStamp `json:"acquired_stamps,omitempty"`
}

type Stamp struct {
	ID    int64  `json:"id"`
	Name  string `json:"name"`
	Image string `json:"image"`
}

type UserStamp struct {
	UserID     int64     `json:"user_id"`
	StampID    int64     `json:"stamp_id"`
	AcquiredAt time.Time `json:"acquired_at"`
}

// Test Cases

func TestE2E_UserCRUD(t *testing.T) {
	t.Run("Create User", func(t *testing.T) {
		reqBody := map[string]string{
			"name": "Test User",
		}

		resp, body := makeRequest(t, http.MethodPost, "/users", reqBody)
		assert.Equal(t, http.StatusCreated, resp.StatusCode)

		var user User
		err := json.Unmarshal(body, &user)
		require.NoError(t, err)
		assert.NotZero(t, user.ID)
		assert.Equal(t, "Test User", user.Name)
	})

	t.Run("Get User", func(t *testing.T) {
		// First create a user
		reqBody := map[string]string{
			"name": "Get Test User",
		}
		resp, body := makeRequest(t, http.MethodPost, "/users", reqBody)
		require.Equal(t, http.StatusCreated, resp.StatusCode)

		var createdUser User
		err := json.Unmarshal(body, &createdUser)
		require.NoError(t, err)

		// Get the user
		resp, body = makeRequest(t, http.MethodGet, fmt.Sprintf("/users/%d", createdUser.ID), nil)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var user UserDetail
		err = json.Unmarshal(body, &user)
		require.NoError(t, err)
		assert.Equal(t, createdUser.ID, user.ID)
		assert.Equal(t, "Get Test User", user.Name)
	})

	t.Run("List Users", func(t *testing.T) {
		resp, body := makeRequest(t, http.MethodGet, "/users", nil)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var users []User
		err := json.Unmarshal(body, &users)
		require.NoError(t, err)
		assert.NotEmpty(t, users)
	})

	t.Run("Update User", func(t *testing.T) {
		// First create a user
		reqBody := map[string]string{
			"name": "Original Name",
		}
		resp, body := makeRequest(t, http.MethodPost, "/users", reqBody)
		require.Equal(t, http.StatusCreated, resp.StatusCode)

		var createdUser User
		err := json.Unmarshal(body, &createdUser)
		require.NoError(t, err)

		// Update the user
		updateBody := map[string]string{
			"name": "Updated Name",
		}
		resp, body = makeRequest(t, http.MethodPut, fmt.Sprintf("/users/%d", createdUser.ID), updateBody)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var updatedUser User
		err = json.Unmarshal(body, &updatedUser)
		require.NoError(t, err)
		assert.Equal(t, "Updated Name", updatedUser.Name)
	})
}

func TestE2E_StampCRUD(t *testing.T) {
	t.Run("Create Stamp", func(t *testing.T) {
		reqBody := map[string]string{
			"name":  "Gopher Basic",
			"image": "https://example.com/gopher-basic.png",
		}

		resp, body := makeRequest(t, http.MethodPost, "/stamps", reqBody)
		assert.Equal(t, http.StatusCreated, resp.StatusCode)

		var stamp Stamp
		err := json.Unmarshal(body, &stamp)
		require.NoError(t, err)
		assert.NotZero(t, stamp.ID)
		assert.Equal(t, "Gopher Basic", stamp.Name)
		assert.Equal(t, "https://example.com/gopher-basic.png", stamp.Image)
	})

	t.Run("Get Stamp", func(t *testing.T) {
		// First create a stamp
		reqBody := map[string]string{
			"name":  "Get Test Stamp",
			"image": "https://example.com/test.png",
		}
		resp, body := makeRequest(t, http.MethodPost, "/stamps", reqBody)
		require.Equal(t, http.StatusCreated, resp.StatusCode)

		var createdStamp Stamp
		err := json.Unmarshal(body, &createdStamp)
		require.NoError(t, err)

		// Get the stamp
		resp, body = makeRequest(t, http.MethodGet, fmt.Sprintf("/stamps/%d", createdStamp.ID), nil)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var stamp Stamp
		err = json.Unmarshal(body, &stamp)
		require.NoError(t, err)
		assert.Equal(t, createdStamp.ID, stamp.ID)
		assert.Equal(t, "Get Test Stamp", stamp.Name)
	})

	t.Run("List Stamps", func(t *testing.T) {
		resp, body := makeRequest(t, http.MethodGet, "/stamps", nil)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var response map[string]interface{}
		err := json.Unmarshal(body, &response)
		require.NoError(t, err)
		assert.Contains(t, response, "stamps")
		assert.Contains(t, response, "total")
	})

	t.Run("Update Stamp", func(t *testing.T) {
		// First create a stamp
		reqBody := map[string]string{
			"name":  "Original Stamp",
			"image": "https://example.com/original.png",
		}
		resp, body := makeRequest(t, http.MethodPost, "/stamps", reqBody)
		require.Equal(t, http.StatusCreated, resp.StatusCode)

		var createdStamp Stamp
		err := json.Unmarshal(body, &createdStamp)
		require.NoError(t, err)

		// Update the stamp
		updateBody := map[string]string{
			"name":  "Updated Stamp",
			"image": "https://example.com/updated.png",
		}
		resp, body = makeRequest(t, http.MethodPut, fmt.Sprintf("/stamps/%d", createdStamp.ID), updateBody)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var updatedStamp Stamp
		err = json.Unmarshal(body, &updatedStamp)
		require.NoError(t, err)
		assert.Equal(t, "Updated Stamp", updatedStamp.Name)
		assert.Equal(t, "https://example.com/updated.png", updatedStamp.Image)
	})

	t.Run("Delete Stamp", func(t *testing.T) {
		// First create a stamp
		reqBody := map[string]string{
			"name":  "Delete Test Stamp",
			"image": "https://example.com/delete.png",
		}
		resp, body := makeRequest(t, http.MethodPost, "/stamps", reqBody)
		require.Equal(t, http.StatusCreated, resp.StatusCode)

		var createdStamp Stamp
		err := json.Unmarshal(body, &createdStamp)
		require.NoError(t, err)

		// Delete the stamp
		resp, _ = makeRequest(t, http.MethodDelete, fmt.Sprintf("/stamps/%d", createdStamp.ID), nil)
		assert.Equal(t, http.StatusNoContent, resp.StatusCode)

		// Verify deletion
		resp, _ = makeRequest(t, http.MethodGet, fmt.Sprintf("/stamps/%d", createdStamp.ID), nil)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)
	})
}

func TestE2E_UserStampAcquisition(t *testing.T) {
	t.Run("Acquire Stamp", func(t *testing.T) {
		// Create a user
		userReq := map[string]string{
			"name": "Stamp Collector",
		}
		resp, body := makeRequest(t, http.MethodPost, "/users", userReq)
		require.Equal(t, http.StatusCreated, resp.StatusCode)

		var user User
		err := json.Unmarshal(body, &user)
		require.NoError(t, err)

		// Create a stamp
		stampReq := map[string]string{
			"name":  "Collectible Stamp",
			"image": "https://example.com/collectible.png",
		}
		resp, body = makeRequest(t, http.MethodPost, "/stamps", stampReq)
		require.Equal(t, http.StatusCreated, resp.StatusCode)

		var stamp Stamp
		err = json.Unmarshal(body, &stamp)
		require.NoError(t, err)

		// Acquire the stamp
		acquireReq := map[string]int64{
			"stamp_id": stamp.ID,
		}
		resp, body = makeRequest(t, http.MethodPost, fmt.Sprintf("/users/%d/stamps", user.ID), acquireReq)
		assert.Equal(t, http.StatusCreated, resp.StatusCode)

		var userStamp UserStamp
		err = json.Unmarshal(body, &userStamp)
		require.NoError(t, err)
		assert.Equal(t, user.ID, userStamp.UserID)
		assert.Equal(t, stamp.ID, userStamp.StampID)
		assert.NotZero(t, userStamp.AcquiredAt)
	})

	t.Run("List User Stamps", func(t *testing.T) {
		// Create a user
		userReq := map[string]string{
			"name": "Stamp Viewer",
		}
		resp, body := makeRequest(t, http.MethodPost, "/users", userReq)
		require.Equal(t, http.StatusCreated, resp.StatusCode)

		var user User
		err := json.Unmarshal(body, &user)
		require.NoError(t, err)

		// Create and acquire a stamp
		stampReq := map[string]string{
			"name":  "View Test Stamp",
			"image": "https://example.com/view-test.png",
		}
		resp, body = makeRequest(t, http.MethodPost, "/stamps", stampReq)
		require.Equal(t, http.StatusCreated, resp.StatusCode)

		var stamp Stamp
		err = json.Unmarshal(body, &stamp)
		require.NoError(t, err)

		acquireReq := map[string]int64{
			"stamp_id": stamp.ID,
		}
		resp, _ = makeRequest(t, http.MethodPost, fmt.Sprintf("/users/%d/stamps", user.ID), acquireReq)
		require.Equal(t, http.StatusCreated, resp.StatusCode)

		// List user stamps
		resp, body = makeRequest(t, http.MethodGet, fmt.Sprintf("/users/%d/stamps", user.ID), nil)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var response map[string][]UserStamp
		err = json.Unmarshal(body, &response)
		require.NoError(t, err)
		assert.Contains(t, response, "stamps")
		assert.NotEmpty(t, response["stamps"])
	})

	t.Run("Get User with Acquired Stamps", func(t *testing.T) {
		// Create a user
		userReq := map[string]string{
			"name": "Complete User",
		}
		resp, body := makeRequest(t, http.MethodPost, "/users", userReq)
		require.Equal(t, http.StatusCreated, resp.StatusCode)

		var user User
		err := json.Unmarshal(body, &user)
		require.NoError(t, err)

		// Create and acquire stamps
		for i := 1; i <= 3; i++ {
			stampReq := map[string]string{
				"name":  fmt.Sprintf("Test Stamp %d", i),
				"image": fmt.Sprintf("https://example.com/test-%d.png", i),
			}
			resp, body = makeRequest(t, http.MethodPost, "/stamps", stampReq)
			require.Equal(t, http.StatusCreated, resp.StatusCode)

			var stamp Stamp
			err = json.Unmarshal(body, &stamp)
			require.NoError(t, err)

			acquireReq := map[string]int64{
				"stamp_id": stamp.ID,
			}
			resp, _ = makeRequest(t, http.MethodPost, fmt.Sprintf("/users/%d/stamps", user.ID), acquireReq)
			require.Equal(t, http.StatusCreated, resp.StatusCode)
		}

		// Get user with stamps
		resp, body = makeRequest(t, http.MethodGet, fmt.Sprintf("/users/%d", user.ID), nil)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		var userDetail UserDetail
		err = json.Unmarshal(body, &userDetail)
		require.NoError(t, err)
		assert.Equal(t, user.ID, userDetail.ID)
		assert.NotNil(t, userDetail.AcquiredStamps)
		assert.Len(t, userDetail.AcquiredStamps, 3)
	})

	t.Run("Prevent Duplicate Stamp Acquisition", func(t *testing.T) {
		// Create a user
		userReq := map[string]string{
			"name": "Duplicate Tester",
		}
		resp, body := makeRequest(t, http.MethodPost, "/users", userReq)
		require.Equal(t, http.StatusCreated, resp.StatusCode)

		var user User
		err := json.Unmarshal(body, &user)
		require.NoError(t, err)

		// Create a stamp
		stampReq := map[string]string{
			"name":  "Unique Stamp",
			"image": "https://example.com/unique.png",
		}
		resp, body = makeRequest(t, http.MethodPost, "/stamps", stampReq)
		require.Equal(t, http.StatusCreated, resp.StatusCode)

		var stamp Stamp
		err = json.Unmarshal(body, &stamp)
		require.NoError(t, err)

		// Acquire the stamp first time
		acquireReq := map[string]int64{
			"stamp_id": stamp.ID,
		}
		resp, _ = makeRequest(t, http.MethodPost, fmt.Sprintf("/users/%d/stamps", user.ID), acquireReq)
		assert.Equal(t, http.StatusCreated, resp.StatusCode)

		// Try to acquire the same stamp again
		resp, _ = makeRequest(t, http.MethodPost, fmt.Sprintf("/users/%d/stamps", user.ID), acquireReq)
		assert.Equal(t, http.StatusConflict, resp.StatusCode)
	})
}
