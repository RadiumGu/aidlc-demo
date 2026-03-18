package com.awsome.shop.auth.domain.security;

/**
 * JWT 令牌提供者接口（领域层端口）
 */
public interface JwtTokenProvider {

    /**
     * 生成 JWT 令牌
     *
     * @param userId   用户ID
     * @param username 用户名
     * @param role     角色
     * @return JWT 令牌字符串
     */
    String generateToken(Long userId, String username, String role);

    /**
     * 获取令牌过期时间（秒）
     */
    long getExpiration();
}
