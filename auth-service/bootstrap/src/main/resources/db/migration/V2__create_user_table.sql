-- 用户表
CREATE TABLE `t_user` (
    `id`              BIGINT       NOT NULL AUTO_INCREMENT,
    `username`        VARCHAR(50)  NOT NULL COMMENT '用户名',
    `password_hash`   VARCHAR(100) NOT NULL COMMENT '密码哈希(BCrypt)',
    `display_name`    VARCHAR(100) DEFAULT NULL COMMENT '显示名称',
    `role`            VARCHAR(20)  NOT NULL COMMENT '角色: ADMIN/EMPLOYEE',
    `avatar`          VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
    `status`          VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE' COMMENT '状态: ACTIVE/DISABLED',
    `failed_attempts` INT          NOT NULL DEFAULT 0 COMMENT '连续登录失败次数',
    `locked_until`    DATETIME     DEFAULT NULL COMMENT '锁定截止时间',
    `created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_by`      BIGINT       DEFAULT NULL,
    `updated_by`      BIGINT       DEFAULT NULL,
    `deleted`         INT          NOT NULL DEFAULT 0 COMMENT '逻辑删除: 0-未删除 1-已删除',
    `version`         INT          NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
