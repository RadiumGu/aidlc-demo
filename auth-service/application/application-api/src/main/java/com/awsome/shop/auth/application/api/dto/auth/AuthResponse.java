package com.awsome.shop.auth.application.api.dto.auth;

import lombok.Data;

/**
 * 认证响应
 */
@Data
public class AuthResponse {

    private String accessToken;

    private String refreshToken;

    private Long expiresIn;

    private String tokenType = "Bearer";

    private UserDTO user;
}
