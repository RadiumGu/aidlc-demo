package com.awsome.shop.auth.application.api.dto.auth;

import lombok.Data;

/**
 * Token 验证响应（内部服务调用）
 */
@Data
public class AuthValidateResponse {

    private Boolean valid;

    private Long userId;

    private String username;

    private String role;
}
