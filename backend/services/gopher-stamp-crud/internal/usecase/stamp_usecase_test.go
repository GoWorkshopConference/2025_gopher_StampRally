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

func TestStampUseCase_ListStamps(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepo := mock.NewMockStampRepository(ctrl)
	usecase := NewStampUseCase(mockRepo)

	now := time.Now()

	tests := []struct {
		name       string
		limit      int
		offset     int
		mockFn     func()
		wantStamps []entity.Stamp
		wantTotal  int64
		wantErr    bool
	}{
		{
			name:   "success with multiple stamps",
			limit:  10,
			offset: 0,
			mockFn: func() {
				mockRepo.EXPECT().
					FindAll(gomock.Any(), 10, 0).
					Return([]entity.Stamp{
						{ID: 1, Name: "Stamp 1", Image: "image1.png", CreatedAt: now, UpdatedAt: now},
						{ID: 2, Name: "Stamp 2", Image: "image2.png", CreatedAt: now, UpdatedAt: now},
					}, nil)
				mockRepo.EXPECT().
					Count(gomock.Any()).
					Return(int64(2), nil)
			},
			wantStamps: []entity.Stamp{
				{ID: 1, Name: "Stamp 1", Image: "image1.png", CreatedAt: now, UpdatedAt: now},
				{ID: 2, Name: "Stamp 2", Image: "image2.png", CreatedAt: now, UpdatedAt: now},
			},
			wantTotal: 2,
			wantErr:   false,
		},
		{
			name:   "success with pagination",
			limit:  5,
			offset: 5,
			mockFn: func() {
				mockRepo.EXPECT().
					FindAll(gomock.Any(), 5, 5).
					Return([]entity.Stamp{
						{ID: 6, Name: "Stamp 6", Image: "image6.png", CreatedAt: now, UpdatedAt: now},
					}, nil)
				mockRepo.EXPECT().
					Count(gomock.Any()).
					Return(int64(10), nil)
			},
			wantStamps: []entity.Stamp{
				{ID: 6, Name: "Stamp 6", Image: "image6.png", CreatedAt: now, UpdatedAt: now},
			},
			wantTotal: 10,
			wantErr:   false,
		},
		{
			name:   "empty list",
			limit:  10,
			offset: 0,
			mockFn: func() {
				mockRepo.EXPECT().
					FindAll(gomock.Any(), 10, 0).
					Return([]entity.Stamp{}, nil)
				mockRepo.EXPECT().
					Count(gomock.Any()).
					Return(int64(0), nil)
			},
			wantStamps: []entity.Stamp{},
			wantTotal:  0,
			wantErr:    false,
		},
		{
			name:   "FindAll error",
			limit:  10,
			offset: 0,
			mockFn: func() {
				mockRepo.EXPECT().
					FindAll(gomock.Any(), 10, 0).
					Return(nil, assert.AnError)
			},
			wantStamps: nil,
			wantTotal:  0,
			wantErr:    true,
		},
		{
			name:   "Count error",
			limit:  10,
			offset: 0,
			mockFn: func() {
				mockRepo.EXPECT().
					FindAll(gomock.Any(), 10, 0).
					Return([]entity.Stamp{}, nil)
				mockRepo.EXPECT().
					Count(gomock.Any()).
					Return(int64(0), assert.AnError)
			},
			wantStamps: nil,
			wantTotal:  0,
			wantErr:    true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.mockFn()
			stamps, total, err := usecase.ListStamps(context.Background(), tt.limit, tt.offset)
			if tt.wantErr {
				assert.Error(t, err)
				assert.Nil(t, stamps)
				assert.Equal(t, int64(0), total)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, tt.wantStamps, stamps)
				assert.Equal(t, tt.wantTotal, total)
			}
		})
	}
}

func TestStampUseCase_GetStamp(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepo := mock.NewMockStampRepository(ctrl)
	usecase := NewStampUseCase(mockRepo)

	now := time.Now()

	tests := []struct {
		name    string
		id      uint
		mockFn  func()
		want    *entity.Stamp
		wantErr bool
		errMsg  string
	}{
		{
			name: "success",
			id:   1,
			mockFn: func() {
				mockRepo.EXPECT().
					FindByID(gomock.Any(), uint(1)).
					Return(&entity.Stamp{
						ID:        1,
						Name:      "Test Stamp",
						Image:     "test.png",
						CreatedAt: now,
						UpdatedAt: now,
					}, nil)
			},
			want: &entity.Stamp{
				ID:        1,
				Name:      "Test Stamp",
				Image:     "test.png",
				CreatedAt: now,
				UpdatedAt: now,
			},
			wantErr: false,
		},
		{
			name: "not found",
			id:   999,
			mockFn: func() {
				mockRepo.EXPECT().
					FindByID(gomock.Any(), uint(999)).
					Return(nil, gorm.ErrRecordNotFound)
			},
			want:    nil,
			wantErr: true,
			errMsg:  "stamp not found",
		},
		{
			name: "database error",
			id:   1,
			mockFn: func() {
				mockRepo.EXPECT().
					FindByID(gomock.Any(), uint(1)).
					Return(nil, assert.AnError)
			},
			want:    nil,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.mockFn()
			got, err := usecase.GetStamp(context.Background(), tt.id)
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

func TestStampUseCase_CreateStamp(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepo := mock.NewMockStampRepository(ctrl)
	usecase := NewStampUseCase(mockRepo)

	tests := []struct {
		name    string
		inName  string
		inImage string
		mockFn  func()
		wantErr bool
	}{
		{
			name:    "success",
			inName:  "New Stamp",
			inImage: "new.png",
			mockFn: func() {
				mockRepo.EXPECT().
					Create(gomock.Any(), gomock.Any()).
					DoAndReturn(func(ctx context.Context, stamp *entity.Stamp) error {
						stamp.ID = 1
						return nil
					})
			},
			wantErr: false,
		},
		{
			name:    "create error",
			inName:  "Failed Stamp",
			inImage: "failed.png",
			mockFn: func() {
				mockRepo.EXPECT().
					Create(gomock.Any(), gomock.Any()).
					Return(assert.AnError)
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.mockFn()
			stamp, err := usecase.CreateStamp(context.Background(), tt.inName, tt.inImage)
			if tt.wantErr {
				assert.Error(t, err)
				assert.Nil(t, stamp)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, stamp)
				assert.Equal(t, tt.inName, stamp.Name)
				assert.Equal(t, tt.inImage, stamp.Image)
			}
		})
	}
}

func TestStampUseCase_UpdateStamp(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepo := mock.NewMockStampRepository(ctrl)
	usecase := NewStampUseCase(mockRepo)

	now := time.Now()
	newName := "Updated Name"
	newImage := "updated.png"

	tests := []struct {
		name    string
		id      uint
		inName  *string
		inImage *string
		mockFn  func()
		want    *entity.Stamp
		wantErr bool
		errMsg  string
	}{
		{
			name:    "success - update both fields",
			id:      1,
			inName:  &newName,
			inImage: &newImage,
			mockFn: func() {
				mockRepo.EXPECT().
					FindByID(gomock.Any(), uint(1)).
					Return(&entity.Stamp{
						ID:        1,
						Name:      "Original Name",
						Image:     "original.png",
						CreatedAt: now,
						UpdatedAt: now,
					}, nil)
				mockRepo.EXPECT().
					Update(gomock.Any(), gomock.Any()).
					Return(nil)
			},
			want: &entity.Stamp{
				ID:        1,
				Name:      "Updated Name",
				Image:     "updated.png",
				CreatedAt: now,
				UpdatedAt: now,
			},
			wantErr: false,
		},
		{
			name:   "success - update name only",
			id:     1,
			inName: &newName,
			mockFn: func() {
				mockRepo.EXPECT().
					FindByID(gomock.Any(), uint(1)).
					Return(&entity.Stamp{
						ID:        1,
						Name:      "Original Name",
						Image:     "original.png",
						CreatedAt: now,
						UpdatedAt: now,
					}, nil)
				mockRepo.EXPECT().
					Update(gomock.Any(), gomock.Any()).
					Return(nil)
			},
			want: &entity.Stamp{
				ID:        1,
				Name:      "Updated Name",
				Image:     "original.png",
				CreatedAt: now,
				UpdatedAt: now,
			},
			wantErr: false,
		},
		{
			name:    "success - update image only",
			id:      1,
			inImage: &newImage,
			mockFn: func() {
				mockRepo.EXPECT().
					FindByID(gomock.Any(), uint(1)).
					Return(&entity.Stamp{
						ID:        1,
						Name:      "Original Name",
						Image:     "original.png",
						CreatedAt: now,
						UpdatedAt: now,
					}, nil)
				mockRepo.EXPECT().
					Update(gomock.Any(), gomock.Any()).
					Return(nil)
			},
			want: &entity.Stamp{
				ID:        1,
				Name:      "Original Name",
				Image:     "updated.png",
				CreatedAt: now,
				UpdatedAt: now,
			},
			wantErr: false,
		},
		{
			name:   "stamp not found",
			id:     999,
			inName: &newName,
			mockFn: func() {
				mockRepo.EXPECT().
					FindByID(gomock.Any(), uint(999)).
					Return(nil, gorm.ErrRecordNotFound)
			},
			want:    nil,
			wantErr: true,
			errMsg:  "stamp not found",
		},
		{
			name:   "update error",
			id:     1,
			inName: &newName,
			mockFn: func() {
				mockRepo.EXPECT().
					FindByID(gomock.Any(), uint(1)).
					Return(&entity.Stamp{
						ID:        1,
						Name:      "Original Name",
						Image:     "original.png",
						CreatedAt: now,
						UpdatedAt: now,
					}, nil)
				mockRepo.EXPECT().
					Update(gomock.Any(), gomock.Any()).
					Return(assert.AnError)
			},
			want:    nil,
			wantErr: true,
		},
		{
			name: "validation error - both nil",
			id:   1,
			mockFn: func() {
				// バリデーションで早期リターンするため、Repoのモックは呼ばれない
			},
			want:    nil,
			wantErr: true,
			errMsg:  "at least one of name or image must be provided",
		},
		{
			name:   "database error on FindByID",
			id:     1,
			inName: &newName,
			mockFn: func() {
				mockRepo.EXPECT().
					FindByID(gomock.Any(), uint(1)).
					Return(nil, assert.AnError)
			},
			want:    nil,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.mockFn()
			got, err := usecase.UpdateStamp(context.Background(), tt.id, tt.inName, tt.inImage)
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

func TestStampUseCase_DeleteStamp(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()

	mockRepo := mock.NewMockStampRepository(ctrl)
	usecase := NewStampUseCase(mockRepo)

	now := time.Now()

	tests := []struct {
		name    string
		id      uint
		mockFn  func()
		wantErr bool
		errMsg  string
	}{
		{
			name: "success",
			id:   1,
			mockFn: func() {
				mockRepo.EXPECT().
					FindByID(gomock.Any(), uint(1)).
					Return(&entity.Stamp{
						ID:        1,
						Name:      "Test Stamp",
						Image:     "test.png",
						CreatedAt: now,
						UpdatedAt: now,
					}, nil)
				mockRepo.EXPECT().
					Delete(gomock.Any(), uint(1)).
					Return(nil)
			},
			wantErr: false,
		},
		{
			name: "stamp not found",
			id:   999,
			mockFn: func() {
				mockRepo.EXPECT().
					FindByID(gomock.Any(), uint(999)).
					Return(nil, gorm.ErrRecordNotFound)
			},
			wantErr: true,
			errMsg:  "stamp not found",
		},
		{
			name: "database error on FindByID",
			id:   1,
			mockFn: func() {
				mockRepo.EXPECT().
					FindByID(gomock.Any(), uint(1)).
					Return(nil, assert.AnError)
			},
			wantErr: true,
		},
		{
			name: "delete error",
			id:   1,
			mockFn: func() {
				mockRepo.EXPECT().
					FindByID(gomock.Any(), uint(1)).
					Return(&entity.Stamp{
						ID:        1,
						Name:      "Test Stamp",
						Image:     "test.png",
						CreatedAt: now,
						UpdatedAt: now,
					}, nil)
				mockRepo.EXPECT().
					Delete(gomock.Any(), uint(1)).
					Return(assert.AnError)
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.mockFn()
			err := usecase.DeleteStamp(context.Background(), tt.id)
			if tt.wantErr {
				assert.Error(t, err)
				if tt.errMsg != "" {
					assert.EqualError(t, err, tt.errMsg)
				}
			} else {
				assert.NoError(t, err)
			}
		})
	}
}
