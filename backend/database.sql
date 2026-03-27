-- =============================================
-- Database schema cho Mobileapp Chat
-- Import vào phpMyAdmin (XAMPP)
-- =============================================

CREATE DATABASE IF NOT EXISTS `mobileapp_chat` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `mobileapp_chat`;

-- =============================================
-- Bảng users
-- =============================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `avatar` VARCHAR(500) DEFAULT NULL,
  `is_online` TINYINT(1) DEFAULT 0,
  `last_seen` DATETIME DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =============================================
-- Bảng conversations
-- =============================================
CREATE TABLE IF NOT EXISTS `conversations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `type` ENUM('private', 'group') NOT NULL DEFAULT 'private',
  `name` VARCHAR(100) DEFAULT NULL COMMENT 'Tên nhóm (chỉ dùng cho group)',
  `avatar` VARCHAR(500) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =============================================
-- Bảng conversation_participants
-- =============================================
CREATE TABLE IF NOT EXISTS `conversation_participants` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `conversation_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `joined_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_participant` (`conversation_id`, `user_id`)
) ENGINE=InnoDB;

-- =============================================
-- Bảng messages
-- =============================================
CREATE TABLE IF NOT EXISTS `messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `conversation_id` INT NOT NULL,
  `sender_id` INT NOT NULL,
  `content` TEXT NOT NULL,
  `type` ENUM('text', 'image', 'video') NOT NULL DEFAULT 'text',
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_conversation_created` (`conversation_id`, `created_at`)
) ENGINE=InnoDB;
