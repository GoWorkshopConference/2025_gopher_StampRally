package usecase

import (
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
					Create(gomock.Any()).
					DoAndReturn(func(user *entity.User) error {
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
					Create(gomock.Any()).
					Return(assert.AnError)
			},
			want:    nil,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.mockFn()
			got, err := usecase.Create(tt.userName)
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
					FindByID(uint(1)).
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
					FindByID(uint(999)).
					Return(nil, assert.AnError)
			},
			want:    nil,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.mockFn()
			got, err := usecase.GetByID(tt.id)
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
					FindAll().
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
					FindAll().
					Return([]*entity.User{}, nil)
			},
			want:    []*entity.User{},
			wantErr: false,
		},
		{
			name: "infrastructure error",
			mockFn: func() {
				mockRepo.EXPECT().
					FindAll().
					Return(nil, assert.AnError)
			},
			want:    nil,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.mockFn()
			got, err := usecase.GetAll()
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

	tests := []struct {
		name     string
		id       uint
		userName string
		mockFn   func()
		want     *entity.User
		wantErr  bool
	}{
		{
			name:     "success",
			id:       1,
			userName: "Updated User",
			mockFn: func() {
				mockRepo.EXPECT().
					FindByID(uint(1)).
					Return(&entity.User{
						ID:   1,
						Name: "Original User",
					}, nil)
				mockRepo.EXPECT().
					Update(gomock.Any()).
					DoAndReturn(func(user *entity.User) error {
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
			name:     "user not found",
			id:       999,
			userName: "Updated User",
			mockFn: func() {
				mockRepo.EXPECT().
					FindByID(uint(999)).
					Return(nil, assert.AnError)
			},
			want:    nil,
			wantErr: true,
		},
		{
			name:     "update error",
			id:       1,
			userName: "Updated User",
			mockFn: func() {
				mockRepo.EXPECT().
					FindByID(uint(1)).
					Return(&entity.User{
						ID:   1,
						Name: "Original User",
					}, nil)
				mockRepo.EXPECT().
					Update(gomock.Any()).
					Return(assert.AnError)
			},
			want:    nil,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.mockFn()
			got, err := usecase.Update(tt.id, tt.userName)
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
					Delete(uint(1)).
					Return(nil)
			},
			wantErr: false,
		},
		{
			name: "not found",
			id:   999,
			mockFn: func() {
				mockRepo.EXPECT().
					Delete(uint(999)).
					Return(assert.AnError)
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.mockFn()
			err := usecase.Delete(tt.id)
			if tt.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}
