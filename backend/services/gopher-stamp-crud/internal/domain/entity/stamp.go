package entity

type Stamp struct {
	ID        uint   `json:"id" gorm:"primaryKey"`
	Name      string `json:"name" gorm:"size:100;not null"`
	SecretKey string `json:"-" gorm:"size:32;not null"`
}
