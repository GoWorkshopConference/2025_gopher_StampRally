package mysql

import (
	"fmt"
	"os"

	"2025_gopher_StampRally/services/gopher-stamp-crud/internal/domain/entity"

	mysqlDriver "gorm.io/driver/mysql"
	"gorm.io/gorm"
)

// initializeStampData inserts initial stamp data if the stamps table is empty
func initializeStampData(db *gorm.DB) error {
	var count int64
	if err := db.Model(&entity.Stamp{}).Count(&count).Error; err != nil {
		return fmt.Errorf("failed to count stamps: %w", err)
	}

	// If stamps already exist, skip initialization
	if count > 0 {
		return nil
	}

	// Initial stamp master data
	initialStamps := []entity.Stamp{
		{Name: "午前ワークショップ"},
		{Name: "午後ワークショップ"},
		{Name: "Go製のゲーム展示"},
		{Name: "ジェスチャーゲーム"},
		{Name: "シャッフルランチ"},
		{Name: "Gopher Wall1 "},
		{Name: "Gopher Wall2"},
		{Name: "Gopher Wall3"},
	}

	if err := db.Create(&initialStamps).Error; err != nil {
		return fmt.Errorf("failed to insert initial stamps: %w", err)
	}

	return nil
}

func NewMySQLClient() (*gorm.DB, error) {
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_NAME")

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		dbUser, dbPassword, dbHost, dbPort, dbName)

	db, err := gorm.Open(mysqlDriver.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Auto-migrate database schema
	if err := db.AutoMigrate(
		&entity.User{},
		&entity.Stamp{},
		&entity.UserStamp{},
	); err != nil {
		return nil, fmt.Errorf("failed to auto-migrate database: %w", err)
	}

	// Initialize stamp master data if not exists
	if err := initializeStampData(db); err != nil {
		return nil, fmt.Errorf("failed to initialize stamp data: %w", err)
	}

	return db, nil
}
