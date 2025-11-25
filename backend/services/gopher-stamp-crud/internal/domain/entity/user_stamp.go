package entity

import "time"

type UserStamp struct {
	UserID     uint      `json:"user_id" gorm:"primaryKey"`
	StampID    uint      `json:"stamp_id" gorm:"primaryKey"`
	AcquiredAt time.Time `json:"acquired_at" gorm:"autoCreateTime"`
	User       User      `json:"user" gorm:"foreignKey:UserID;references:ID"`
	Stamp      Stamp     `json:"stamp" gorm:"foreignKey:StampID;references:ID"`
}
