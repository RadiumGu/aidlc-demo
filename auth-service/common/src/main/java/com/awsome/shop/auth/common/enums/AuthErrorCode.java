package com.awsome.shop.auth.common.enums;

/**
 * 认证业务错误码
 */
public enum AuthErrorCode implements ErrorCode {

    INVALID_CREDENTIALS("AUTH_001", "用户名或密码错误"),
    ACCOUNT_LOCKED("LOCKED_001", "账号已锁定，请在{0}分钟后重试"),
    ACCOUNT_DISABLED("AUTH_002", "账号已禁用"),
    INVALID_TOKEN("AUTH_003", "Token无效或已过期"),
    USER_NOT_FOUND("NOT_FOUND_002", "用户不存在");

    private final String code;
    private final String message;

    AuthErrorCode(String code, String message) {
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
