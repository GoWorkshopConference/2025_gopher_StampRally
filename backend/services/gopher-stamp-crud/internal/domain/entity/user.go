package entity

import "time"

// User represents a participant of the stamp rally.
// It corresponds to the OpenAPI User schema.
type User struct {
	ID uint `json:"id" gorm:"primaryKey"`

	// Basic profile
	Name string `json:"name" gorm:"size:100;not null"` // ニックネームとして使用

	// Optional metadata used by the frontend
	TwitterID         *string `json:"twitter_id,omitempty" gorm:"size:50"`
	FavoriteGoFeature *string `json:"favorite_go_feature,omitempty" gorm:"size:500"`
	Icon              *string `json:"icon,omitempty" gorm:"type:longtext"` // base64エンコードされた画像を保存するためLONGTEXTを使用

	// Timestamps
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}
