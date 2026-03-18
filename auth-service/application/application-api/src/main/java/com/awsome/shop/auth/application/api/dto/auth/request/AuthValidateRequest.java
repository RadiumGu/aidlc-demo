package com.awsome.shop.auth.application.api.dto.auth.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Token 验证请求（内部服务调用）
 */
@Data
public class AuthValidateRequest {

    @NotBlank(message = "Token不能为空")
    private String token;
}
