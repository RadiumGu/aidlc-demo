package com.awsome.shop.auth.repository.user;

import com.awsome.shop.auth.domain.model.user.UserEntity;

/**
 * 用户仓储接口
 */
public interface UserRepository {

    UserEntity findByUsername(String username);

    UserEntity findById(Long id);

    void save(UserEntity entity);

    void updateFailedAttempts(Long id, Integer failedAttempts, java.time.LocalDateTime lockedUntil);
}
