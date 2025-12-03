package usecase

import (
	"context"
	"testing"

	"2025_gopher_StampRally/services/gopher-stamp-crud/internal/domain/entity"
	mock "2025_gopher_StampRally/services/gopher-stamp-crud/internal/domain/mock_repository"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"
)

func TestUserUsecase_Create(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepo := mock.NewMockUserRepository(ctrl)
	usecase := NewUserUsecase(mockRepo)

	tests := []struct {
		name     string
		userName string
		mockFn   func()
		want     *entity.User
		wantErr  bool
	}{
		{
			name:     "success",
			userName: "Test User",
			mockFn: func() {
				mockRepo.EXPECT().
					Create(gomock.Any(), gomock.Any()).
					DoAndReturn(func(ctx context.Context, user *entity.User) error {
						user.ID = 1 // リポジトリで設定されるIDをシミュレート
						return nil
					})
			},
			want: &entity.User{
				ID:   1,
				Name: "Test User",
			},
			wantErr: false,
		},
		{
			name:     "infrastructure error",
			userName: "Test User",
			mockFn: func() {
				mockRepo.EXPECT().
					Create(gomock.Any(), gomock.Any()).
					Return(assert.AnError)
			},
			want:    nil,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.mockFn()
			got, err := usecase.Create(context.Background(), tt.userName, nil, nil, nil)
			if tt.wantErr {
				assert.Error(t, err)
				assert.Nil(t, got)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.want, got)
			}
		})
	}
}

func TestUserUsecase_GetByID(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepo := mock.NewMockUserRepository(ctrl)
	usecase := NewUserUsecase(mockRepo)

	tests := []struct {
		name    string
		id      uint
		mockFn  func()
		want    *entity.User
		wantErr bool
	}{
		{
			name: "success",
			id:   1,
			mockFn: func() {
				mockRepo.EXPECT().
					FindByID(gomock.Any(), uint(1)).
					Return(&entity.User{
						ID:   1,
						Name: "Test User",
					}, nil)
			},
			want: &entity.User{
				ID:   1,
				Name: "Test User",
			},
			wantErr: false,
		},
		{
			name: "not found",
			id:   999,
			mockFn: func() {
				mockRepo.EXPECT().
					FindByID(gomock.Any(), uint(999)).
					Return(nil, assert.AnError)
			},
			want:    nil,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.mockFn()
			got, err := usecase.GetByID(context.Background(), tt.id)
			if tt.wantErr {
				assert.Error(t, err)
				assert.Nil(t, got)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.want, got)
			}
		})
	}
}

func TestUserUsecase_GetAll(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepo := mock.NewMockUserRepository(ctrl)
	usecase := NewUserUsecase(mockRepo)

	tests := []struct {
		name    string
		mockFn  func()
		want    []*entity.User
		wantErr bool
	}{
		{
			name: "success",
			mockFn: func() {
				mockRepo.EXPECT().
					FindAll(gomock.Any()).
					Return([]*entity.User{
						{ID: 1, Name: "User 1"},
						{ID: 2, Name: "User 2"},
					}, nil)
			},
			want: []*entity.User{
				{ID: 1, Name: "User 1"},
				{ID: 2, Name: "User 2"},
			},
			wantErr: false,
		},
		{
			name: "empty list",
			mockFn: func() {
				mockRepo.EXPECT().
					FindAll(gomock.Any()).
					Return([]*entity.User{}, nil)
			},
			want:    []*entity.User{},
			wantErr: false,
		},
		{
			name: "infrastructure error",
			mockFn: func() {
				mockRepo.EXPECT().
					FindAll(gomock.Any()).
					Return(nil, assert.AnError)
			},
			want:    nil,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.mockFn()
			got, err := usecase.GetAll(context.Background())
			if tt.wantErr {
				assert.Error(t, err)
				assert.Nil(t, got)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.want, got)
			}
		})
	}
}

func TestUserUsecase_Update(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepo := mock.NewMockUserRepository(ctrl)
	usecase := NewUserUsecase(mockRepo)

	updatedName := "Updated User"
	updatedTwitterID := "updated_twitter"
	updatedFavoriteGoFeature := "CONCURRENCY"
	updatedIcon := "data:image/png;base64,..."

	tests := []struct {
		testName          string
		id                uint
		name              *string
		twitterID         *string
		favoriteGoFeature *string
		icon              *string
		mockFn            func()
		want              *entity.User
		wantErr           bool
	}{
		{
			testName: "success - update name only",
			id:       1,
			name:     &updatedName,
			mockFn: func() {
				mockRepo.EXPECT().
					FindByID(gomock.Any(), uint(1)).
					Return(&entity.User{
						ID:   1,
						Name: "Original User",
					}, nil)
				mockRepo.EXPECT().
					Update(gomock.Any(), gomock.Any()).
					DoAndReturn(func(ctx context.Context, user *entity.User) error {
						return nil
					})
			},
			want: &entity.User{
				ID:   1,
				Name: "Updated User",
			},
			wantErr: false,
		},
		{
			testName:          "success - update all fields",
			id:                1,
			name:              &updatedName,
			twitterID:         &updatedTwitterID,
			favoriteGoFeature: &updatedFavoriteGoFeature,
			icon:              &updatedIcon,
			mockFn: func() {
				mockRepo.EXPECT().
					FindByID(gomock.Any(), uint(1)).
					Return(&entity.User{
						ID:   1,
						Name: "Original User",
					}, nil)
				mockRepo.EXPECT().
					Update(gomock.Any(), gomock.Any()).
					DoAndReturn(func(ctx context.Context, user *entity.User) error {
						return nil
					})
			},
			want: &entity.User{
				ID:                1,
				Name:              "Updated User",
				TwitterID:         &updatedTwitterID,
				FavoriteGoFeature: &updatedFavoriteGoFeature,
				Icon:              &updatedIcon,
			},
			wantErr: false,
		},
		{
			testName: "user not found",
			id:       999,
			name:     &updatedName,
			mockFn: func() {
				mockRepo.EXPECT().
					FindByID(gomock.Any(), uint(999)).
					Return(nil, assert.AnError)
			},
			want:    nil,
			wantErr: true,
		},
		{
			testName: "update error",
			id:       1,
			name:     &updatedName,
			mockFn: func() {
				mockRepo.EXPECT().
					FindByID(gomock.Any(), uint(1)).
					Return(&entity.User{
						ID:   1,
						Name: "Original User",
					}, nil)
				mockRepo.EXPECT().
					Update(gomock.Any(), gomock.Any()).
					Return(assert.AnError)
			},
			want:    nil,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.testName, func(t *testing.T) {
			tt.mockFn()
			got, err := usecase.Update(context.Background(), tt.id, tt.name, tt.twitterID, tt.favoriteGoFeature, tt.icon)
			if tt.wantErr {
				assert.Error(t, err)
				assert.Nil(t, got)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.want.ID, got.ID)
				assert.Equal(t, tt.want.Name, got.Name)
				if tt.want.TwitterID != nil {
					assert.Equal(t, tt.want.TwitterID, got.TwitterID)
				}
				if tt.want.FavoriteGoFeature != nil {
					assert.Equal(t, tt.want.FavoriteGoFeature, got.FavoriteGoFeature)
				}
				if tt.want.Icon != nil {
					assert.Equal(t, tt.want.Icon, got.Icon)
				}
			}
		})
	}
}

func TestUserUsecase_Delete(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepo := mock.NewMockUserRepository(ctrl)
	usecase := NewUserUsecase(mockRepo)

	tests := []struct {
		name    string
		id      uint
		mockFn  func()
		wantErr bool
	}{
		{
			name: "success",
			id:   1,
			mockFn: func() {
				mockRepo.EXPECT().
					Delete(gomock.Any(), uint(1)).
					Return(nil)
			},
			wantErr: false,
		},
		{
			name: "not found",
			id:   999,
			mockFn: func() {
				mockRepo.EXPECT().
					Delete(gomock.Any(), uint(999)).
					Return(assert.AnError)
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.mockFn()
			err := usecase.Delete(context.Background(), tt.id)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}
