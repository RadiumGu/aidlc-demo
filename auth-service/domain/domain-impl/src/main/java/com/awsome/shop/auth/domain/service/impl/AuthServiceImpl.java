package com.awsome.shop.auth.domain.service.impl;

import com.awsome.shop.auth.common.enums.AuthErrorCode;
import com.awsome.shop.auth.common.exception.BusinessException;
import com.awsome.shop.auth.domain.model.User;
import com.awsome.shop.auth.domain.model.enums.Role;
import com.awsome.shop.auth.domain.model.enums.UserStatus;
import com.awsome.shop.auth.domain.repository.UserRepository;
import com.awsome.shop.auth.domain.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * 认证领域服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

    @Override
    public User register(User user) {
        // 唯一性校验 — 用户名
        if (userRepository.findByUsername(user.getUsername()) != null) {
            throw new BusinessException(AuthErrorCode.USERNAME_EXISTS);
        }
        // 唯一性校验 — 工号
        if (userRepository.findByEmployeeId(user.getEmployeeId()) != null) {
            throw new BusinessException(AuthErrorCode.EMPLOYEE_ID_EXISTS);
        }

        // 密码加密
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // 默认角色和状态
        user.setRole(Role.EMPLOYEE);
        user.setStatus(UserStatus.ACTIVE);

        return userRepository.save(user);
    }

    @Override
    public User login(String username, String password) {
        // 查询用户（不存在统一返回 BAD_CREDENTIALS）
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new BusinessException(AuthErrorCode.BAD_CREDENTIALS);
        }

        // 账号状态检查
        if (user.getStatus() == UserStatus.DISABLED) {
            throw new BusinessException(AuthErrorCode.ACCOUNT_DISABLED);
        }

        // 密码校验
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BusinessException(AuthErrorCode.BAD_CREDENTIALS);
        }

        return user;
    }
}
