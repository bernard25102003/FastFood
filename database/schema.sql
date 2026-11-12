-- ==============================================================================
-- FASTFOOD DATABASE SCHEMA (MySQL 8.0 & TiDB Cloud Serverless Compatible)
-- Charset: utf8mb4, Collation: utf8mb4_unicode_ci
-- Primary Keys: VARCHAR(36) (UUID / CUID friendly for TiDB distributed sharding)
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `fastfood_db` 
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `fastfood_db`;

-- Tắt kiểm tra khóa ngoại tạm thời để tránh xung đột khi drop
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `payment_transactions`;
DROP TABLE IF EXISTS `email_otps`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `product_images`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------------------------
-- 1. USERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE `users` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `address` VARCHAR(255) DEFAULT NULL,
  `role` VARCHAR(20) NOT NULL DEFAULT 'USER' COMMENT 'USER, ADMIN',
  `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE, LOCKED',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. CATEGORIES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE `categories` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `icon` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_categories_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. PRODUCTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE `products` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `price` DOUBLE NOT NULL DEFAULT 0.0,
  `category_id` VARCHAR(64) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `sold_count` INT NOT NULL DEFAULT 0,
  `avg_rating` DOUBLE NOT NULL DEFAULT 0.0,
  `review_count` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_products_category` (`category_id`),
  KEY `idx_products_price` (`price`),
  KEY `idx_products_sold_count` (`sold_count`),
  KEY `idx_products_avg_rating` (`avg_rating`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. PRODUCT IMAGES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE `product_images` (
  `id` VARCHAR(64) NOT NULL,
  `product_id` VARCHAR(64) NOT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `is_primary` TINYINT(1) NOT NULL DEFAULT 0,
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_images_product_id` (`product_id`),
  CONSTRAINT `fk_product_images_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. ORDERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE `orders` (
  `id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `total_price` DOUBLE NOT NULL DEFAULT 0.0,
  `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING, CONFIRMED, SHIPPING, COMPLETED, CANCELLED',
  `payment_method` VARCHAR(20) NOT NULL DEFAULT 'COD' COMMENT 'COD, BANK_TRANSFER',
  `payment_status` VARCHAR(20) NOT NULL DEFAULT 'UNPAID' COMMENT 'UNPAID, PAID, REFUNDED',
  `payment_code` VARCHAR(50) DEFAULT NULL COMMENT 'Mã thanh toán VietQR động ví dụ: FF8921',
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `notes` TEXT DEFAULT NULL,
  `confirmed_at` TIMESTAMP NULL DEFAULT NULL,
  `completed_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_orders_user_id` (`user_id`),
  KEY `idx_orders_status` (`status`),
  KEY `idx_orders_payment_code` (`payment_code`),
  CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. ORDER ITEMS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE `order_items` (
  `id` VARCHAR(64) NOT NULL,
  `order_id` VARCHAR(64) NOT NULL,
  `product_id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `price` DOUBLE NOT NULL DEFAULT 0.0,
  `image` VARCHAR(500) DEFAULT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `subtotal` DOUBLE NOT NULL DEFAULT 0.0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order_id` (`order_id`),
  KEY `idx_order_items_product_id` (`product_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. REVIEWS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE `reviews` (
  `id` VARCHAR(64) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `product_id` VARCHAR(64) NOT NULL,
  `rating` INT NOT NULL DEFAULT 5 COMMENT '1 - 5',
  `comment` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_reviews_user_product` (`user_id`, `product_id`),
  KEY `idx_reviews_product_id` (`product_id`),
  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 8. EMAIL OTPS TABLE (Xác thực đăng ký & quên mật khẩu qua Brevo)
-- ------------------------------------------------------------------------------
CREATE TABLE `email_otps` (
  `id` VARCHAR(36) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `otp_code` VARCHAR(10) NOT NULL,
  `otp_type` VARCHAR(30) NOT NULL DEFAULT 'REGISTER' COMMENT 'REGISTER, FORGOT_PASSWORD',
  `attempts` INT NOT NULL DEFAULT 0,
  `is_used` TINYINT(1) NOT NULL DEFAULT 0,
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email_otps_lookup` (`email`, `otp_code`, `otp_type`, `is_used`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 9. PAYMENT TRANSACTIONS TABLE (Lưu log SePay Webhook - chống trùng lặp)
-- ------------------------------------------------------------------------------
CREATE TABLE `payment_transactions` (
  `id` VARCHAR(64) NOT NULL,
  `order_id` VARCHAR(64) DEFAULT NULL,
  `gateway` VARCHAR(50) NOT NULL DEFAULT 'SEPAY',
  `transaction_id` VARCHAR(100) NOT NULL COMMENT 'ID giao dịch duy nhất từ SePay',
  `amount_in` DOUBLE NOT NULL DEFAULT 0.0,
  `content` TEXT DEFAULT NULL COMMENT 'Nội dung chuyển khoản chứa payment_code',
  `bank_brand` VARCHAR(50) DEFAULT NULL,
  `account_number` VARCHAR(50) DEFAULT NULL,
  `transaction_date` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_payment_transactions_tid` (`transaction_id`),
  KEY `idx_payment_transactions_order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

