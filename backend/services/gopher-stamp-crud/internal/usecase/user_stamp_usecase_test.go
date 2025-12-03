package usecase

import (
	"context"
	"testing"
	"time"

	"2025_gopher_StampRally/services/gopher-stamp-crud/internal/domain/entity"
	mock "2025_gopher_StampRally/services/gopher-stamp-crud/internal/domain/mock_repository"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"
)

func TestUserStampUseCase_ListUserStamps(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUserRepo := mock.NewMockUserRepository(ctrl)
	mockStampRepo := mock.NewMockStampRepository(ctrl)
	mockUserStampRepo := mock.NewMockUserStampRepository(ctrl)
	usecase := NewUserStampUseCase(mockUserStampRepo, mockUserRepo, mockStampRepo)

	now := time.Now()

	tests := []struct {
		name    string
		userID  uint
		mockFn  func()
		want    []entity.UserStamp
		wantErr bool
		errMsg  string
	}{
		{
			name:   "success with stamps",
			userID: 1,
			mockFn: func() {
				mockUserRepo.EXPECT().
					FindByID(gomock.Any(), uint(1)).
					Return(&entity.User{ID: 1, Name: "Test User"}, nil)
				mockUserStampRepo.EXPECT().
					FindByUserID(gomock.Any(), uint(1)).
					Return([]entity.UserStamp{
						{
							UserID:     1,
							StampID:    1,
							AcquiredAt: now,
							Stamp:      entity.Stamp{ID: 1, Name: "Stamp 1"},
						},
						{
							UserID:     1,
							StampID:    2,
							AcquiredAt: now,
							Stamp:      entity.Stamp{ID: 2, Name: "Stamp 2"},
						},
					}, nil)
			},
			want: []entity.UserStamp{
				{
					UserID:     1,
					StampID:    1,
					AcquiredAt: now,
					Stamp:      entity.Stamp{ID: 1, Name: "Stamp 1"},
				},
				{
					UserID:     1,
					StampID:    2,
					AcquiredAt: now,
					Stamp:      entity.Stamp{ID: 2, Name: "Stamp 2"},
				},
			},
			wantErr: false,
		},
		{
			name:   "success with empty list",
			userID: 1,
			mockFn: func() {
				mockUserRepo.EXPECT().
					FindByID(gomock.Any(), uint(1)).
					Return(&entity.User{ID: 1, Name: "Test User"}, nil)
				mockUserStampRepo.EXPECT().
					FindByUserID(gomock.Any(), uint(1)).
					Return([]entity.UserStamp{}, nil)
			},
			want:    []entity.UserStamp{},
			wantErr: false,
		},
		{
			name:   "user not found",
			userID: 999,
			mockFn: func() {
				mockUserRepo.EXPECT().
					FindByID(gomock.Any(), uint(999)).
					Return(nil, gorm.ErrRecordNotFound)
			},
			want:    nil,
			wantErr: true,
			errMsg:  "user not found",
		},
		{
			name:   "database error on user check",
			userID: 1,
			mockFn: func() {
				mockUserRepo.EXPECT().
					FindByID(gomock.Any(), uint(1)).
					Return(nil, assert.AnError)
			},
			want:    nil,
			wantErr: true,
		},
		{
			name:   "database error on FindByUserID",
			userID: 1,
			mockFn: func() {
				mockUserRepo.EXPECT().
					FindByID(gomock.Any(), uint(1)).
					Return(&entity.User{ID: 1, Name: "Test User"}, nil)
				mockUserStampRepo.EXPECT().
					FindByUserID(gomock.Any(), uint(1)).
					Return(nil, assert.AnError)
			},
			want:    nil,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.mockFn()
			got, err := usecase.ListUserStamps(context.Background(), tt.userID)
			if tt.wantErr {
				assert.Error(t, err)
				assert.Nil(t, got)
				if tt.errMsg != "" {
					assert.EqualError(t, err, tt.errMsg)
				}
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.want, got)
			}
		})
	}
}

func TestUserStampUseCase_AcquireStamp(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockUserRepo := mock.NewMockUserRepository(ctrl)
	mockStampRepo := mock.NewMockStampRepository(ctrl)
	mockUserStampRepo := mock.NewMockUserStampRepository(ctrl)
	usecase := NewUserStampUseCase(mockUserStampRepo, mockUserRepo, mockStampRepo)

	now := time.Now()

	tests := []struct {
		name    string
		userID  uint
		stampID uint
		mockFn  func()
		wantErr bool
		errMsg  string
	}{
		{
			name:    "success - acquire new stamp",
			userID:  1,
			stampID: 1,
			mockFn: func() {
				// User exists check
				mockUserRepo.EXPECT().
					FindByID(gomock.Any(), uint(1)).
					Return(&entity.User{ID: 1, Name: "Test User"}, nil)

				// Stamp exists check
				mockStampRepo.EXPECT().
					FindByID(gomock.Any(), uint(1)).
					Return(&entity.Stamp{ID: 1, Name: "Test Stamp"}, nil)

				// Not already acquired check
				mockUserStampRepo.EXPECT().
					ExistsByUserIDAndStampID(gomock.Any(), uint(1), uint(1)).
					Return(false, nil)

				// Create user stamp
				mockUserStampRepo.EXPECT().
					Create(gomock.Any(), gomock.Any()).
					DoAndReturn(func(ctx context.Context, us *entity.UserStamp) error {
						us.AcquiredAt = now
						return nil
					})

				// Reload with associations
				mockUserStampRepo.EXPECT().
					FindByUserID(gomock.Any(), uint(1)).
					Return([]entity.UserStamp{
						{
							UserID:     1,
							StampID:    1,
							AcquiredAt: now,
							Stamp:      entity.Stamp{ID: 1, Name: "Test Stamp"},
						},
					}, nil)
			},
			wantErr: false,
		},
		{
			name:    "user not found",
			userID:  999,
			stampID: 1,
			mockFn: func() {
				mockUserRepo.EXPECT().
					FindByID(gomock.Any(), uint(999)).
					Return(nil, gorm.ErrRecordNotFound)
			},
			wantErr: true,
			errMsg:  "user not found",
		},
		{
			name:    "stamp not found",
			userID:  1,
			stampID: 999,
			mockFn: func() {
				mockUserRepo.EXPECT().
					FindByID(gomock.Any(), uint(1)).
					Return(&entity.User{ID: 1, Name: "Test User"}, nil)
				mockStampRepo.EXPECT().
					FindByID(gomock.Any(), uint(999)).
					Return(nil, gorm.ErrRecordNotFound)
			},
			wantErr: true,
			errMsg:  "stamp not found",
		},
		{
			name:    "stamp already acquired (duplicate prevention)",
			userID:  1,
			stampID: 1,
			mockFn: func() {
				mockUserRepo.EXPECT().
					FindByID(gomock.Any(), uint(1)).
					Return(&entity.User{ID: 1, Name: "Test User"}, nil)
				mockStampRepo.EXPECT().
					FindByID(gomock.Any(), uint(1)).
					Return(&entity.Stamp{ID: 1, Name: "Test Stamp"}, nil)
				mockUserStampRepo.EXPECT().
					ExistsByUserIDAndStampID(gomock.Any(), uint(1), uint(1)).
					Return(true, nil)
			},
			wantErr: true,
			errMsg:  "stamp already acquired",
		},
		{
			name:    "database error on user check",
			userID:  1,
			stampID: 1,
			mockFn: func() {
				mockUserRepo.EXPECT().
					FindByID(gomock.Any(), uint(1)).
					Return(nil, assert.AnError)
			},
			wantErr: true,
		},
		{
			name:    "database error on stamp check",
			userID:  1,
			stampID: 1,
			mockFn: func() {
				mockUserRepo.EXPECT().
					FindByID(gomock.Any(), uint(1)).
					Return(&entity.User{ID: 1, Name: "Test User"}, nil)
				mockStampRepo.EXPECT().
					FindByID(gomock.Any(), uint(1)).
					Return(nil, assert.AnError)
			},
			wantErr: true,
		},
		{
			name:    "database error on exists check",
			userID:  1,
			stampID: 1,
			mockFn: func() {
				mockUserRepo.EXPECT().
					FindByID(gomock.Any(), uint(1)).
					Return(&entity.User{ID: 1, Name: "Test User"}, nil)
				mockStampRepo.EXPECT().
					FindByID(gomock.Any(), uint(1)).
					Return(&entity.Stamp{ID: 1, Name: "Test Stamp"}, nil)
				mockUserStampRepo.EXPECT().
					ExistsByUserIDAndStampID(gomock.Any(), uint(1), uint(1)).
					Return(false, assert.AnError)
			},
			wantErr: true,
		},
		{
			name:    "database error on create",
			userID:  1,
			stampID: 1,
			mockFn: func() {
				mockUserRepo.EXPECT().
					FindByID(gomock.Any(), uint(1)).
					Return(&entity.User{ID: 1, Name: "Test User"}, nil)
				mockStampRepo.EXPECT().
					FindByID(gomock.Any(), uint(1)).
					Return(&entity.Stamp{ID: 1, Name: "Test Stamp"}, nil)
				mockUserStampRepo.EXPECT().
					ExistsByUserIDAndStampID(gomock.Any(), uint(1), uint(1)).
					Return(false, nil)
				mockUserStampRepo.EXPECT().
					Create(gomock.Any(), gomock.Any()).
					Return(assert.AnError)
			},
			wantErr: true,
		},
		{
			name:    "database error on reload",
			userID:  1,
			stampID: 1,
			mockFn: func() {
				mockUserRepo.EXPECT().
					FindByID(gomock.Any(), uint(1)).
					Return(&entity.User{ID: 1, Name: "Test User"}, nil)
				mockStampRepo.EXPECT().
					FindByID(gomock.Any(), uint(1)).
					Return(&entity.Stamp{ID: 1, Name: "Test Stamp"}, nil)
				mockUserStampRepo.EXPECT().
					ExistsByUserIDAndStampID(gomock.Any(), uint(1), uint(1)).
					Return(false, nil)
				mockUserStampRepo.EXPECT().
					Create(gomock.Any(), gomock.Any()).
					Return(nil)
				mockUserStampRepo.EXPECT().
					FindByUserID(gomock.Any(), uint(1)).
					Return(nil, assert.AnError)
			},
			wantErr: true,
		},
		{
			name:    "success - stamp not found in reload (fallback path)",
			userID:  1,
			stampID: 1,
			mockFn: func() {
				mockUserRepo.EXPECT().
					FindByID(gomock.Any(), uint(1)).
					Return(&entity.User{ID: 1, Name: "Test User"}, nil)
				mockStampRepo.EXPECT().
					FindByID(gomock.Any(), uint(1)).
					Return(&entity.Stamp{ID: 1, Name: "Test Stamp"}, nil)
				mockUserStampRepo.EXPECT().
					ExistsByUserIDAndStampID(gomock.Any(), uint(1), uint(1)).
					Return(false, nil)
				mockUserStampRepo.EXPECT().
					Create(gomock.Any(), gomock.Any()).
					DoAndReturn(func(ctx context.Context, us *entity.UserStamp) error {
						us.AcquiredAt = now
						return nil
					})
				// Return empty list to trigger fallback path
				mockUserStampRepo.EXPECT().
					FindByUserID(gomock.Any(), uint(1)).
					Return([]entity.UserStamp{
						{
							UserID:     1,
							StampID:    2, // Different stampID to not match
							AcquiredAt: now,
						},
					}, nil)
			},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.mockFn()
			got, err := usecase.AcquireStamp(context.Background(), tt.userID, tt.stampID)
			if tt.wantErr {
				assert.Error(t, err)
				assert.Nil(t, got)
				if tt.errMsg != "" {
					assert.EqualError(t, err, tt.errMsg)
				}
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, got)
				assert.Equal(t, tt.userID, got.UserID)
				assert.Equal(t, tt.stampID, got.StampID)
			}
		})
	}
}
