package com.awsome.shop.points.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 积分变动类型枚举
 */
@Getter
@AllArgsConstructor
public enum TransactionType {

    DISTRIBUTION("系统自动发放"),
    MANUAL_ADD("管理员手动增加"),
    MANUAL_DEDUCT("管理员手动扣除"),
    REDEMPTION("兑换扣除"),
    ROLLBACK("兑换回滚");

    private final String description;
}
