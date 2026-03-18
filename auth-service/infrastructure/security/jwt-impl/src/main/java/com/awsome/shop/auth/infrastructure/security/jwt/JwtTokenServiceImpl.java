package com.awsome.shop.auth.infrastructure.security.jwt;

import com.awsome.shop.auth.domain.service.auth.JwtTokenService;
import com.awsome.shop.auth.infrastructure.cache.redis.TokenBlacklistService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JWT Token 服务实现（JJWT + Redis 黑名单）
 */
@Slf4j
@Service
public class JwtTokenServiceImpl implements JwtTokenService {

    private final SecretKey secretKey;
    private final long accessTokenExpiration;
    private final long refreshTokenExpiration;
    private final String issuer;
    private final TokenBlacklistService tokenBlacklistService;

    public JwtTokenServiceImpl(
            @Value("${security.jwt.secret}") String secret,
            @Value("${security.jwt.expiration:7200}") long accessTokenExpiration,
            @Value("${security.jwt.refresh-expiration:604800}") long refreshTokenExpiration,
            @Value("${security.jwt.issuer:awsome-shop-auth-service}") String issuer,
            TokenBlacklistService tokenBlacklistService) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;
        this.issuer = issuer;
        this.tokenBlacklistService = tokenBlacklistService;
    }

    @Override
    public String generateAccessToken(Long userId, String username, String role) {
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer(issuer)
                .subject(username)
                .claim("userId", userId)
                .claim("username", username)
                .claim("role", role)
                .claim("type", "access")
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(accessTokenExpiration)))
                .signWith(secretKey)
                .compact();
    }

    @Override
    public String generateRefreshToken(Long userId, String username) {
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer(issuer)
                .subject(username)
                .claim("userId", userId)
                .claim("username", username)
                .claim("type", "refresh")
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(refreshTokenExpiration)))
                .signWith(secretKey)
                .compact();
    }

    @Override
    public Map<String, Object> validate(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        Map<String, Object> result = new HashMap<>();
        result.put("userId", claims.get("userId"));
        result.put("username", claims.get("username"));
        result.put("role", claims.get("role"));
        result.put("type", claims.get("type"));
        result.put("exp", claims.getExpiration());
        return result;
    }

    @Override
    public void invalidate(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            long ttl = (claims.getExpiration().getTime() - System.currentTimeMillis()) / 1000;
            tokenBlacklistService.add(token, ttl);
        } catch (Exception e) {
            log.warn("Token失效处理异常: {}", e.getMessage());
        }
    }

    @Override
    public boolean isBlacklisted(String token) {
        return tokenBlacklistService.contains(token);
    }
}
