-- =====================================================
-- BÁO MỚI PORTAL - Database Schema
-- blog_database
-- Cập nhật: 2026-04-18
-- =====================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `blog_database`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE `blog_database`;

-- ─────────────────────────────────────────
-- 1. USERS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `users` (
  `id`          int          NOT NULL AUTO_INCREMENT,
  `username`    varchar(50)  NOT NULL,
  `email`       varchar(100) NOT NULL,
  `password`    varchar(255) NOT NULL,
  `full_name`   varchar(100) DEFAULT NULL,
  `avatar_url`  varchar(500) DEFAULT NULL,
  `role_id`     tinyint      NOT NULL DEFAULT '2' COMMENT '1=admin, 2=user',
  `created_at`  datetime     DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  datetime     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email`    (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─────────────────────────────────────────
-- 2. CATEGORIES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `categories` (
  `id`         int          NOT NULL AUTO_INCREMENT,
  `name`       varchar(100) NOT NULL,
  `slug`       varchar(120) NOT NULL,
  `created_at` datetime     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─────────────────────────────────────────
-- 3. POSTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `posts` (
  `id`             int             NOT NULL AUTO_INCREMENT,
  `title`          varchar(300)    NOT NULL,
  `slug`           varchar(320)    NOT NULL,
  `content`        longtext        NOT NULL,
  `thumbnail`      varchar(500)    DEFAULT NULL,
  `status`         enum('draft','published') NOT NULL DEFAULT 'draft',
  `views`          int             NOT NULL DEFAULT '0',
  `average_rating` decimal(3,2)    DEFAULT NULL,
  `category_id`    int             DEFAULT NULL,
  `author_id`      int             DEFAULT NULL,
  `created_at`     datetime        DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     datetime        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_posts_status`   (`status`),
  KEY `idx_posts_category` (`category_id`),
  KEY `idx_posts_author`   (`author_id`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `posts_ibfk_2` FOREIGN KEY (`author_id`)   REFERENCES `users`      (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─────────────────────────────────────────
-- 4. COMMENTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `comments` (
  `id`         int      NOT NULL AUTO_INCREMENT,
  `content`    text     NOT NULL,
  `post_id`    int      NOT NULL,
  `user_id`    int      NOT NULL,
  `parent_id`  int      DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id`              (`user_id`),
  KEY `idx_comments_post`    (`post_id`),
  KEY `idx_comments_parent`  (`parent_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`post_id`)   REFERENCES `posts`    (`id`) ON DELETE CASCADE,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`)   REFERENCES `users`    (`id`) ON DELETE CASCADE,
  CONSTRAINT `comments_ibfk_3` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─────────────────────────────────────────
-- 5. LIKES (comment likes)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `likes` (
  `id`         int      NOT NULL AUTO_INCREMENT,
  `comment_id` int      NOT NULL,
  `user_id`    int      NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_like` (`comment_id`, `user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`user_id`)    REFERENCES `users`    (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─────────────────────────────────────────
-- 6. BOOKMARKS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `bookmarks` (
  `id`         int      NOT NULL AUTO_INCREMENT,
  `post_id`    int      NOT NULL,
  `user_id`    int      NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_bookmark` (`post_id`, `user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `bookmarks_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bookmarks_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─────────────────────────────────────────
-- 7. POST_RATINGS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `post_ratings` (
  `id`         int     NOT NULL AUTO_INCREMENT,
  `post_id`    int     NOT NULL,
  `user_id`    int     NOT NULL,
  `score`      tinyint NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_rating` (`post_id`, `user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `post_ratings_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `post_ratings_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `post_ratings_chk_1`  CHECK (`score` BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─────────────────────────────────────────
-- 8. NOTIFICATIONS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `notifications` (
  `id`         int          NOT NULL AUTO_INCREMENT,
  `user_id`    int          NOT NULL,
  `type`       varchar(50)  DEFAULT 'general',
  `message`    text         NOT NULL,
  `content`    text         DEFAULT NULL,
  `is_read`    tinyint(1)   NOT NULL DEFAULT '0',
  `created_at` datetime     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notif_user` (`user_id`),
  KEY `idx_notif_read` (`is_read`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─────────────────────────────────────────
-- 9. READING_HISTORY
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `reading_history` (
  `id`      int      NOT NULL AUTO_INCREMENT,
  `post_id` int      NOT NULL,
  `user_id` int      NOT NULL,
  `read_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_history` (`post_id`, `user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `reading_history_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reading_history_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─────────────────────────────────────────
-- 10. COMMENT_REPORTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `comment_reports` (
  `id`         int          NOT NULL AUTO_INCREMENT,
  `comment_id` int          NOT NULL,
  `user_id`    int          NOT NULL,
  `reason`     varchar(255) NOT NULL,
  `created_at` datetime     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_report` (`comment_id`, `user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `comment_reports_ibfk_1` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comment_reports_ibfk_2` FOREIGN KEY (`user_id`)    REFERENCES `users`    (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─────────────────────────────────────────
-- 11. TOKEN_BLACKLIST
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `token_blacklist` (
  `id`         int      NOT NULL AUTO_INCREMENT,
  `token`      text     NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ─────────────────────────────────────────
-- DỮ LIỆU MẪU BAN ĐẦU
-- ─────────────────────────────────────────

-- Tài khoản admin mặc định (password: admin123 - bcrypt)
INSERT IGNORE INTO `users` (`id`, `username`, `email`, `password`, `full_name`, `role_id`)
VALUES (3, 'admin', 'admin@gmail.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Admin', 1);

-- Danh mục tin tức
INSERT IGNORE INTO `categories` (`id`, `name`, `slug`) VALUES
  (1, 'Công nghệ',  'cong-nghe'),
  (2, 'Kinh doanh', 'kinh-doanh'),
  (3, 'Thể thao',   'the-thao'),
  (4, 'Giải trí',   'giai-tri'),
  (5, 'Sức khỏe',   'suc-khoe'),
  (6, 'Giáo dục',   'giao-duc'),
  (7, 'Quốc tế',    'quoc-te'),
  (8, 'Thời sự',    'thoi-su');

SET FOREIGN_KEY_CHECKS = 1;
