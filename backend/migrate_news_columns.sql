-- Migration: thêm các cột mới cho tính năng quản lý tin tức
-- Chạy file này 1 lần để cập nhật database

USE blog_database;

-- Thêm cột mô tả ngắn (nếu chưa có)
ALTER TABLE posts 
  ADD COLUMN IF NOT EXISTS `description`       text          DEFAULT NULL  COMMENT 'Mô tả ngắn bài viết' AFTER `content`,
  ADD COLUMN IF NOT EXISTS `image_caption`     varchar(500)  DEFAULT NULL  COMMENT 'Ghi chú ảnh' AFTER `thumbnail`,
  ADD COLUMN IF NOT EXISTS `friendly_title`    varchar(300)  DEFAULT NULL  COMMENT 'SEO title' AFTER `slug`,
  ADD COLUMN IF NOT EXISTS `meta_description`  varchar(500)  DEFAULT NULL  COMMENT 'Meta description' AFTER `friendly_title`,
  ADD COLUMN IF NOT EXISTS `meta_keyword`      varchar(500)  DEFAULT NULL  COMMENT 'Meta keywords' AFTER `meta_description`,
  ADD COLUMN IF NOT EXISTS `source`            varchar(200)  DEFAULT NULL  COMMENT 'Nguồn bài viết' AFTER `meta_keyword`,
  ADD COLUMN IF NOT EXISTS `display_order`     int           NOT NULL DEFAULT 0 COMMENT 'Thứ tự hiển thị' AFTER `source`;

SELECT 'Migration hoàn thành!' AS result;
