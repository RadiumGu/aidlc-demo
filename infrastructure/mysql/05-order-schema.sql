-- ============================================================
-- order_db — 兑换订单表
-- ============================================================

USE order_db;

CREATE TABLE IF NOT EXISTS orders (
    id                      BIGINT          AUTO_INCREMENT PRIMARY KEY,
    user_id                 BIGINT          NOT NULL COMMENT '用户ID',
    product_id              BIGINT          NOT NULL COMMENT '产品ID',
    product_name            VARCHAR(200)    NOT NULL COMMENT '产品名称（冗余快照）',
    product_image_url       VARCHAR(500)    NULL COMMENT '产品图片（冗余快照）',
    points_cost             INT             NOT NULL COMMENT '消耗积分',
    points_transaction_id   BIGINT          NULL COMMENT '积分扣除流水ID（取消时用于回滚）',
    status                  ENUM('PENDING', 'READY', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING' COMMENT '兑换状态',
    created_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_orders_user_id (user_id),
    INDEX idx_orders_status (status),
    INDEX idx_orders_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='兑换订单表';
