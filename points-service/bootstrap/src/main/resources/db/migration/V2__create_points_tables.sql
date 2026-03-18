-- 积分账户表
CREATE TABLE IF NOT EXISTS t_points_account (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id  BIGINT         NOT NULL COMMENT '员工ID',
    balance      BIGINT         NOT NULL DEFAULT 0 COMMENT '当前余额',
    total_earned BIGINT         NOT NULL DEFAULT 0 COMMENT '累计获得',
    total_spent  BIGINT         NOT NULL DEFAULT 0 COMMENT '累计消费',
    created_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_employee_id (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='积分账户表';

-- 积分流水表
CREATE TABLE IF NOT EXISTS t_points_transaction (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id   BIGINT       NOT NULL COMMENT '员工ID',
    type          VARCHAR(32)  NOT NULL COMMENT '类型: EARN, SPEND, ADMIN_ADD, ADMIN_DEDUCT',
    amount        BIGINT       NOT NULL COMMENT '变动数量',
    balance_after BIGINT       NOT NULL COMMENT '变动后余额',
    order_id      VARCHAR(64)  DEFAULT NULL COMMENT '关联订单ID',
    operator_id   BIGINT       DEFAULT NULL COMMENT '操作人ID',
    remark        VARCHAR(256) DEFAULT NULL COMMENT '备注',
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_employee_id (employee_id),
    KEY idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='积分流水表';

-- 初始化种子数据：给测试员工创建积分账户
INSERT INTO t_points_account (employee_id, balance, total_earned, total_spent)
VALUES (1, 2580, 2580, 0);

INSERT INTO t_points_transaction (employee_id, type, amount, balance_after, operator_id, remark)
VALUES (1, 'ADMIN_ADD', 2580, 2580, 1, '系统初始化积分');
