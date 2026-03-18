package com.awsome.shop.auth.domain.service.impl;

import com.awsome.shop.auth.common.dto.PageResult;
import com.awsome.shop.auth.common.enums.AuthErrorCode;
import com.awsome.shop.auth.common.exception.BusinessException;
import com.awsome.shop.auth.domain.model.User;
import com.awsome.shop.auth.domain.model.enums.UserStatus;
import com.awsome.shop.auth.domain.repository.UserRepository;
import com.awsome.shop.auth.domain.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * 用户领域服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public User getUserById(Long id) {
        User user = userRepository.findById(id);
        if (user == null) {
            throw new BusinessException(AuthErrorCode.USER_NOT_FOUND);
        }
        return user;
    }

    @Override
    public PageResult<User> getUserList(int page, int size, String keyword) {
        // 参数边界处理
        page = Math.max(page, 0);
        size = Math.max(1, Math.min(size, 100));
        return userRepository.findPage(page, size, keyword);
    }

    @Override
    public User updateUser(Long id, String name, UserStatus status, Long operatorId) {
        User user = userRepository.findById(id);
        if (user == null) {
            throw new BusinessException(AuthErrorCode.USER_NOT_FOUND);
        }

        // 不允许禁用自己
        if (status == UserStatus.DISABLED && id.equals(operatorId)) {
            throw new BusinessException(AuthErrorCode.CANNOT_DISABLE_SELF);
        }

        // 更新字段（仅更新非 null 值）
        if (name != null) {
            user.setName(name);
        }
        if (status != null) {
            user.setStatus(status);
        }

        userRepository.update(user);
        return userRepository.findById(id);
    }
}
