-- ============================================================
-- auth_db — 用户表
-- ============================================================

USE auth_db;

CREATE TABLE IF NOT EXISTS users (
    id          BIGINT          AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(50)     NOT NULL,
    password    VARCHAR(255)    NOT NULL COMMENT 'bcrypt 加密',
    name        VARCHAR(100)    NOT NULL COMMENT '姓名',
    employee_id VARCHAR(50)     NOT NULL COMMENT '工号',
    role        ENUM('EMPLOYEE', 'ADMIN') NOT NULL DEFAULT 'EMPLOYEE',
    status      ENUM('ACTIVE', 'DISABLED') NOT NULL DEFAULT 'ACTIVE',
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_users_username (username),
    UNIQUE KEY uk_users_employee_id (employee_id),
    INDEX idx_users_username (username),
    INDEX idx_users_employee_id (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';
