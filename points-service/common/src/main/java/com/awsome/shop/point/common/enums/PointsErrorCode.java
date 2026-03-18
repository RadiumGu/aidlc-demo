package com.awsome.shop.point.common.enums;

/**
 * 积分业务错误码
 */
public enum PointsErrorCode implements ErrorCode {

    ACCOUNT_NOT_FOUND("NOT_FOUND_100", "积分账户不存在"),

    INSUFFICIENT_BALANCE("PARAM_100", "积分余额不足");

    private final String code;
    private final String message;

    PointsErrorCode(String code, String message) {
        this.code = code;
        this.message = message;
    }

    @Override
    public String getCode() {
        return code;
    }

    @Override
    public String getMessage() {
        return message;
    }
}
