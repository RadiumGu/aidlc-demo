-- ============================================================
-- product_db — 分类表 + 产品表
-- ============================================================

USE product_db;

CREATE TABLE IF NOT EXISTS categories (
    id          BIGINT          AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL COMMENT '分类名称',
    parent_id   BIGINT          NULL COMMENT '父分类ID（NULL 为顶级）',
    sort_order  INT             NOT NULL DEFAULT 0 COMMENT '排序序号',
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_categories_parent_id (parent_id),
    CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品分类表';

CREATE TABLE IF NOT EXISTS products (
    id          BIGINT          AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(200)    NOT NULL COMMENT '产品名称',
    description TEXT            NULL COMMENT '产品描述',
    points_price INT            NOT NULL COMMENT '所需积分',
    stock       INT             NOT NULL DEFAULT 0 COMMENT '库存数量',
    image_url   VARCHAR(500)    NULL COMMENT '产品图片URL',
    category_id BIGINT          NOT NULL COMMENT '所属分类',
    status      ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE' COMMENT '产品状态',
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_products_category_id (category_id),
    INDEX idx_products_name (name),
    INDEX idx_products_status (status),
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品表';
