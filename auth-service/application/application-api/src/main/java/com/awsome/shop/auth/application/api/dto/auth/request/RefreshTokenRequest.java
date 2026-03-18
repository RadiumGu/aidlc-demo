package com.awsome.shop.auth.application.api.dto.auth.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 刷新 Token 请求
 */
@Data
public class RefreshTokenRequest {

    @NotBlank(message = "Refresh Token不能为空")
    private String refreshToken;
}
