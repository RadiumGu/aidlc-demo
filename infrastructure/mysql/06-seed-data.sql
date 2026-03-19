-- ============================================================
-- AWSomeShop — 种子数据
-- ============================================================
SET NAMES utf8mb4;

-- ----- 默认管理员账号 -----
-- 密码: admin123 (bcrypt 加密)
USE auth_db;
INSERT INTO users (username, password, name, employee_id, role, status) VALUES
('admin', '$2b$10$orYoVb3d.241NkrKw0QiROh4W2GHnfhWzAjyMDjTQ41iYKKeSXmjK', '系统管理员', 'ADMIN001', 'ADMIN', 'ACTIVE');

-- ----- 默认积分发放配置 -----
USE points_db;
INSERT INTO system_configs (config_key, config_value, description) VALUES
('distribution_amount', '100', '每次发放积分数量'),
('distribution_period', 'MONTHLY', '发放周期'),
('distribution_day', '1', '每月发放日（1号）'),
('distribution_enabled', 'true', '是否启用自动发放');

-- ----- 管理员初始积分 -----
INSERT INTO point_balances (user_id, balance) VALUES (1, 5000);

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

-- ----- 示例产品 -----
INSERT INTO products (name, description, points_price, stock, image_url, category_id, status) VALUES
('Sony WH-1000XM5 头戴式耳机', '业界领先的降噪技术，30小时续航', 2000, 50, NULL, 4, 'ACTIVE'),
('AirPods Pro 2', '主动降噪，自适应通透模式，MagSafe充电', 1800, 30, NULL, 4, 'ACTIVE'),
('Anker 65W 氮化镓充电器', '三口输出，小巧便携，兼容多设备', 500, 100, NULL, 5, 'ACTIVE'),
('小米 20000mAh 移动电源', '双向快充，三设备同时充电', 600, 80, NULL, 5, 'ACTIVE'),
('无印良品 香薰机', '超声波雾化，静音设计，自动断电', 800, 40, NULL, 6, 'ACTIVE'),
('戴森 V12 吸尘器', '强劲吸力，激光探测灰尘，60分钟续航', 3500, 15, NULL, 6, 'ACTIVE'),
('罗技 MX Master 3S 鼠标', '静音点击，8000DPI，多设备切换', 700, 60, NULL, 7, 'ACTIVE'),
('Herman Miller Aeron 坐垫', '人体工学设计，透气网布', 1200, 25, NULL, 7, 'ACTIVE'),
('三只松鼠坚果礼盒', '8种坚果混合装，年货送礼佳品', 300, 200, NULL, 8, 'ACTIVE'),
('良品铺子 零食大礼包', '30包混合装，办公室必备', 250, 150, NULL, 8, 'ACTIVE'),
('星巴克 咖啡豆礼盒', '中度烘焙，产地精选，200g×3', 400, 100, NULL, 9, 'ACTIVE'),
('农夫山泉 NFC果汁 整箱', '100%鲜榨，无添加，300ml×24瓶', 350, 120, NULL, 9, 'ACTIVE');
