package com.awsome.shop.auth.application.dto;

import lombok.Builder;
import lombok.Data;

/**
 * 登录令牌响应 DTO
 */
@Data
@Builder
public class TokenResponse {

    private String token;
    private Long userId;
    private String username;
    private String role;
    private Long expiresIn;
}
