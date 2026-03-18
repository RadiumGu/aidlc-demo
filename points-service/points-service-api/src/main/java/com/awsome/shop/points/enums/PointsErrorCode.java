package com.awsome.shop.points.enums;

import com.awsome.shop.points.common.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 积分模块错误码
 */
@Getter
@AllArgsConstructor
public enum PointsErrorCode implements ErrorCode {

    BALANCE_NOT_FOUND("POINTS_001", 404, "积分余额记录不存在"),
    INSUFFICIENT_FOR_ADJUST("POINTS_002", 400, "扣除后余额不足"),
    INSUFFICIENT_FOR_REDEEM("POINTS_003", 400, "积分不足，无法兑换"),
    TRANSACTION_NOT_FOUND("POINTS_004", 404, "积分变动记录不存在"),
    ONLY_REDEMPTION_ROLLBACK("POINTS_005", 400, "只能回滚兑换扣除记录"),
    ALREADY_ROLLED_BACK("POINTS_006", 409, "该笔扣除已回滚，不可重复操作"),
    CONFIG_NOT_FOUND("POINTS_007", 404, "配置项不存在");

    private final String code;
    private final int httpStatus;
    private final String message;
}
