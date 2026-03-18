package com.awsome.shop.auth.common.enums;

/**
 * 认证服务业务错误码
 *
 * <p>错误码前缀决定 HTTP 状态码映射，参见 {@link ErrorCode} 接口说明。</p>
 *
 * <ul>
 *   <li>CONFLICT_ → 409 Conflict</li>
 *   <li>AUTH_ → 401 Unauthorized</li>
 *   <li>NOT_FOUND_ → 404 Not Found</li>
 *   <li>PARAM_ → 400 Bad Request</li>
 *   <li>AUTHZ_ → 403 Forbidden</li>
 * </ul>
 */
public enum AuthErrorCode implements ErrorCode {

    /** 用户名已存在 */
    USERNAME_EXISTS("CONFLICT_001", "用户名已存在"),

    /** 工号已存在 */
    EMPLOYEE_ID_EXISTS("CONFLICT_002", "工号已存在"),

    /** 用户名或密码错误（统一提示，防止用户名枚举） */
    BAD_CREDENTIALS("AUTH_001", "用户名或密码错误"),

    /** 用户不存在 */
    USER_NOT_FOUND("NOT_FOUND_001", "用户不存在"),

    /** 请求参数校验失败 */
    VALIDATION_ERROR("PARAM_001", "请求参数校验失败"),

    /** 账号已被禁用 */
    ACCOUNT_DISABLED("AUTHZ_001", "账号已被禁用"),

    /** 不能禁用自己的账号 */
    CANNOT_DISABLE_SELF("PARAM_002", "不能禁用自己的账号");

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
