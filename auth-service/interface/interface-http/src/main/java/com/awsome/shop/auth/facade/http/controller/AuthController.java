package com.awsome.shop.auth.facade.http.controller;

import com.awsome.shop.auth.application.api.dto.auth.AuthResponse;
import com.awsome.shop.auth.application.api.dto.auth.UserDTO;
import com.awsome.shop.auth.application.api.dto.auth.request.LoginRequest;
import com.awsome.shop.auth.application.api.dto.auth.request.RefreshTokenRequest;
import com.awsome.shop.auth.application.api.service.auth.AuthApplicationService;
import com.awsome.shop.auth.common.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 认证 Controller
 */
@Tag(name = "Auth", description = "用户认证")
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class AuthController {

    private final AuthApplicationService authApplicationService;

    @Operation(summary = "用户登录")
    @PostMapping("/public/auth/login")
    public Result<AuthResponse> login(@RequestBody @Valid LoginRequest request) {
        return Result.success(authApplicationService.login(request));
    }

    @Operation(summary = "用户登出")
    @PostMapping("/auth/logout")
    public Result<Void> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        String token = extractToken(authHeader);
        if (token != null) {
            authApplicationService.logout(token);
        }
        return Result.success();
    }

    @Operation(summary = "刷新Token")
    @PostMapping("/public/auth/refresh")
    public Result<AuthResponse> refresh(@RequestBody @Valid RefreshTokenRequest request) {
        return Result.success(authApplicationService.refreshToken(request));
    }

    @Operation(summary = "获取当前用户信息")
    @GetMapping("/auth/me")
    public Result<UserDTO> me(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        String token = extractToken(authHeader);
        return Result.success(authApplicationService.getCurrentUser(token));
    }

    private String extractToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
}
