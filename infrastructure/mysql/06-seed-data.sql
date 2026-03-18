-- ============================================================
-- AWSomeShop — 种子数据
-- ============================================================

-- ----- 默认管理员账号 -----
-- 密码: admin123 (bcrypt 加密)
USE auth_db;
INSERT INTO users (username, password, name, employee_id, role, status) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '系统管理员', 'ADMIN001', 'ADMIN', 'ACTIVE');

-- ----- 默认积分发放配置 -----
USE points_db;
INSERT INTO system_configs (config_key, config_value, description) VALUES
('distribution_amount', '100', '每次发放积分数量'),
('distribution_period', 'MONTHLY', '发放周期'),
('distribution_day', '1', '每月发放日（1号）'),
('distribution_enabled', 'true', '是否启用自动发放');

-- ----- 示例产品分类 -----
USE product_db;

-- 一级分类
INSERT INTO categories (id, name, parent_id, sort_order) VALUES
(1, '电子产品', NULL, 1),
(2, '生活用品', NULL, 2),
(3, '食品饮料', NULL, 3);

-- 二级分类
INSERT INTO categories (id, name, parent_id, sort_order) VALUES
(4, '耳机', 1, 1),
(5, '充电配件', 1, 2),
(6, '家居', 2, 1),
(7, '办公用品', 2, 2),
(8, '零食', 3, 1),
(9, '饮品', 3, 2);
