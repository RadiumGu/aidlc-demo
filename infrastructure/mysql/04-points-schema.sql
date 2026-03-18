-- ============================================================
-- points_db — 积分余额 + 积分流水 + 系统配置 + 发放批次
-- ============================================================

USE points_db;

CREATE TABLE IF NOT EXISTS point_balances (
    id          BIGINT          AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT          NOT NULL COMMENT '用户ID（逻辑关联 auth_db.users）',
    balance     INT             NOT NULL DEFAULT 0 COMMENT '当前积分余额',
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_point_balances_user_id (user_id),
    INDEX idx_point_balances_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='积分余额表';

CREATE TABLE IF NOT EXISTS point_transactions (
    id              BIGINT      AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT      NOT NULL COMMENT '用户ID',
    type            ENUM('DISTRIBUTION', 'MANUAL_ADD', 'MANUAL_DEDUCT', 'REDEMPTION', 'ROLLBACK') NOT NULL COMMENT '变动类型',
    amount          INT         NOT NULL COMMENT '变动数量（正数增加，负数减少）',
    balance_after   INT         NOT NULL COMMENT '变动后余额',
    reference_id    BIGINT      NULL COMMENT '关联ID（兑换订单ID等）',
    operator_id     BIGINT      NULL COMMENT '操作人ID（手动调整时）',
    remark          VARCHAR(500) NULL COMMENT '备注',
    created_at      DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_point_transactions_user_id (user_id),
    INDEX idx_point_transactions_type (type),
    INDEX idx_point_transactions_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='积分变动流水表';

CREATE TABLE IF NOT EXISTS system_configs (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    config_key      VARCHAR(100)    NOT NULL COMMENT '配置键',
    config_value    VARCHAR(500)    NOT NULL COMMENT '配置值',
    description     VARCHAR(200)    NULL COMMENT '配置说明',
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_system_configs_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

CREATE TABLE IF NOT EXISTS distribution_batches (
    id                  BIGINT      AUTO_INCREMENT PRIMARY KEY,
    distribution_amount INT         NOT NULL COMMENT '本次发放额度',
    total_count         INT         NOT NULL DEFAULT 0 COMMENT '应发放总人数',
    success_count       INT         NOT NULL DEFAULT 0 COMMENT '成功发放人数',
    fail_count          INT         NOT NULL DEFAULT 0 COMMENT '失败人数',
    status              ENUM('RUNNING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'RUNNING' COMMENT '批次状态',
    started_at          DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '开始时间',
    completed_at        DATETIME    NULL COMMENT '完成时间',

    INDEX idx_distribution_batches_status (status),
    INDEX idx_distribution_batches_started_at (started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='积分发放批次表';
