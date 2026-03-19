-- ============================================================
-- order_db — 添加收货信息字段
-- ============================================================
SET NAMES utf8mb4;
USE order_db;

ALTER TABLE orders
    ADD COLUMN username        VARCHAR(100) NULL COMMENT '兑换员工用户名' AFTER user_id,
    ADD COLUMN receiver_name    VARCHAR(100) NULL COMMENT '收货人姓名' AFTER status,
    ADD COLUMN receiver_phone   VARCHAR(20)  NULL COMMENT '收货人电话' AFTER receiver_name,
    ADD COLUMN receiver_address VARCHAR(500) NULL COMMENT '收货地址'   AFTER receiver_phone;
