package com.awsome.shop.auth.domain.impl.service.auth;

import com.awsome.shop.auth.common.enums.AuthErrorCode;
import com.awsome.shop.auth.common.exception.BusinessException;
import com.awsome.shop.auth.domain.model.user.UserEntity;
import com.awsome.shop.auth.domain.service.auth.AuthDomainService;
import com.awsome.shop.auth.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;

/**
 * 认证领域服务实现
 */
@Service
@RequiredArgsConstructor
public class AuthDomainServiceImpl implements AuthDomainService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${security.login.max-failed-attempts:5}")
    private int maxFailedAttempts;

    @Value("${security.login.lock-duration:1800}")
    private long lockDurationSeconds;

    @Override
    public UserEntity authenticate(String username, String password) {
        UserEntity user = userRepository.findByUsername(username);
        if (user == null) {
            throw new BusinessException(AuthErrorCode.INVALID_CREDENTIALS);
        }

        if (!user.isActive()) {
            throw new BusinessException(AuthErrorCode.ACCOUNT_DISABLED);
        }

        if (user.isLocked()) {
            long minutesLeft = Duration.between(LocalDateTime.now(), user.getLockedUntil()).toMinutes() + 1;
            throw new BusinessException(AuthErrorCode.ACCOUNT_LOCKED, minutesLeft);
        }

        if (!user.authenticate(password, passwordEncoder::matches)) {
            user.incrementFailedAttempts();
            LocalDateTime lockedUntil = null;
            if (user.getFailedAttempts() >= maxFailedAttempts) {
                lockedUntil = LocalDateTime.now().plusSeconds(lockDurationSeconds);
            }
            userRepository.updateFailedAttempts(user.getId(), user.getFailedAttempts(), lockedUntil);
            throw new BusinessException(AuthErrorCode.INVALID_CREDENTIALS);
        }

        // 登录成功，重置失败次数
        if (user.getFailedAttempts() != null && user.getFailedAttempts() > 0) {
            userRepository.updateFailedAttempts(user.getId(), 0, null);
        }
        user.resetFailedAttempts();
        return user;
    }

    @Override
    public UserEntity getUserById(Long userId) {
        UserEntity user = userRepository.findById(userId);
        if (user == null) {
            throw new BusinessException(AuthErrorCode.USER_NOT_FOUND);
        }
        return user;
    }
}
