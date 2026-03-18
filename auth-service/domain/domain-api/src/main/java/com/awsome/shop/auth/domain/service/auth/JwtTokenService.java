package com.awsome.shop.auth.domain.service.auth;

import java.util.Map;

/**
 * JWT Token 服务接口
 */
public interface JwtTokenService {

    /**
     * 生成 Access Token
     */
    String generateAccessToken(Long userId, String username, String role);

    /**
     * 生成 Refresh Token
     */
    String generateRefreshToken(Long userId, String username);

    /**
     * 验证并解析 Token，返回 claims
     */
    Map<String, Object> validate(String token);

    /**
     * 将 Token 加入黑名单（登出时调用）
     */
    void invalidate(String token);

    /**
     * 检查 Token 是否在黑名单中
     */
    boolean isBlacklisted(String token);
}
