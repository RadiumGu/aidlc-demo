package com.awsome.shop.auth.interfaces.http;

import com.awsome.shop.auth.application.dto.LoginRequest;
import com.awsome.shop.auth.application.dto.RegisterRequest;
import com.awsome.shop.auth.application.dto.TokenResponse;
import com.awsome.shop.auth.application.dto.UserResponse;
import com.awsome.shop.auth.application.service.AuthAppService;
import com.awsome.shop.auth.common.result.Result;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 认证控制器
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthAppService authAppService;

    /**
     * 用户注册
     */
    @PostMapping("/register")
    public Result<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        return Result.success(authAppService.register(request));
    }

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public Result<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        return Result.success(authAppService.login(request));
    }

    /**
     * 退出登录（前端清除令牌策略，后端直接返回成功）
     */
    @PostMapping("/logout")
    public Result<Void> logout() {
        return Result.success();
    }
}
