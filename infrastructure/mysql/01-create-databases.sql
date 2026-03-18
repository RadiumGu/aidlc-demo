-- ============================================================
-- AWSomeShop — 数据库和用户创建脚本
-- 创建 4 个独立 database，每个微服务使用独立用户
-- ============================================================

-- auth_db
CREATE DATABASE IF NOT EXISTS auth_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'auth_user'@'%' IDENTIFIED BY 'auth_pass_2026';
GRANT ALL PRIVILEGES ON auth_db.* TO 'auth_user'@'%';

-- product_db
CREATE DATABASE IF NOT EXISTS product_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'product_user'@'%' IDENTIFIED BY 'product_pass_2026';
GRANT ALL PRIVILEGES ON product_db.* TO 'product_user'@'%';

-- points_db
CREATE DATABASE IF NOT EXISTS points_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'points_user'@'%' IDENTIFIED BY 'points_pass_2026';
GRANT ALL PRIVILEGES ON points_db.* TO 'points_user'@'%';

-- order_db
CREATE DATABASE IF NOT EXISTS order_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'order_user'@'%' IDENTIFIED BY 'order_pass_2026';
GRANT ALL PRIVILEGES ON order_db.* TO 'order_user'@'%';

FLUSH PRIVILEGES;
