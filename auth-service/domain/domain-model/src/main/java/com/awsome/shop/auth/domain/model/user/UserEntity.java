package com.awsome.shop.auth.domain.model.user;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 用户领域实体
 */
@Data
public class UserEntity {

    private Long id;

    private String username;

    private String passwordHash;

    private String displayName;

    private UserRole role;

    private String avatar;

    private UserStatus status;

    private Integer failedAttempts;

    private LocalDateTime lockedUntil;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    /**
     * 验证密码是否匹配（由调用方提供匹配逻辑）
     */
    public boolean authenticate(String rawPassword, PasswordMatcher matcher) {
        return matcher.matches(rawPassword, this.passwordHash);
    }

    public boolean isLocked() {
        return lockedUntil != null && LocalDateTime.now().isBefore(lockedUntil);
    }

    public boolean isActive() {
        return status == UserStatus.ACTIVE;
    }

    public void incrementFailedAttempts() {
        this.failedAttempts = (this.failedAttempts == null ? 0 : this.failedAttempts) + 1;
    }

    public void resetFailedAttempts() {
        this.failedAttempts = 0;
        this.lockedUntil = null;
    }

    /**
     * 密码匹配函数式接口
     */
    @FunctionalInterface
    public interface PasswordMatcher {
        boolean matches(String rawPassword, String encodedPassword);
    }
}
