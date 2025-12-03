-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    -- ニックネーム（表示名）
    name VARCHAR(100) NOT NULL,
    -- Twitter ID（@なしで保存）
    twitter_id VARCHAR(50) NULL,
    -- 好きなGoのポイント（複数選択はカンマ区切りなどで保存）
    favorite_go_feature VARCHAR(500) NULL,
    -- プロフィール画像URL
    icon VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create stamps table
CREATE TABLE IF NOT EXISTS stamps (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create user_stamps table (junction table)
CREATE TABLE IF NOT EXISTS user_stamps (
    user_id BIGINT UNSIGNED NOT NULL,
    stamp_id BIGINT UNSIGNED NOT NULL,
    acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, stamp_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (stamp_id) REFERENCES stamps(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for better performance
CREATE INDEX idx_user_stamps_user_id ON user_stamps(user_id);
CREATE INDEX idx_user_stamps_stamp_id ON user_stamps(stamp_id);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_stamps_created_at ON stamps(created_at);
