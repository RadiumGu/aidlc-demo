package com.awsome.shop.auth.infrastructure.cache.redis;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.concurrent.TimeUnit;

/**
 * Token 黑名单服务（Redis 实现）
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TokenBlacklistService {

    private static final String KEY_PREFIX = "auth:blacklist:";

    private final StringRedisTemplate stringRedisTemplate;

    /**
     * 将 Token 加入黑名单
     *
     * @param token  JWT Token
     * @param ttlSeconds 剩余有效时间（秒）
     */
    public void add(String token, long ttlSeconds) {
        if (ttlSeconds <= 0) {
            return;
        }
        try {
            String key = KEY_PREFIX + sha256(token);
            stringRedisTemplate.opsForValue().set(key, "1", ttlSeconds, TimeUnit.SECONDS);
        } catch (Exception e) {
            log.warn("Token黑名单写入失败，降级跳过: {}", e.getMessage());
        }
    }

    /**
     * 检查 Token 是否在黑名单中
     */
    public boolean contains(String token) {
        try {
            String key = KEY_PREFIX + sha256(token);
            return Boolean.TRUE.equals(stringRedisTemplate.hasKey(key));
        } catch (Exception e) {
            // Redis 故障时降级：跳过黑名单检查，不阻塞
            log.warn("Token黑名单查询失败，降级跳过: {}", e.getMessage());
            return false;
        }
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("SHA-256计算失败", e);
        }
    }
}
