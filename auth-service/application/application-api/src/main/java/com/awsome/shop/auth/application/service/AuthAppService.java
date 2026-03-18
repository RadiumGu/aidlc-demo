package com.awsome.shop.auth.application.service;

import com.awsome.shop.auth.application.dto.*;
import com.awsome.shop.auth.common.dto.PageResult;

/**
 * 认证应用服务接口（编排层）
 */
public interface AuthAppService {

    UserResponse register(RegisterRequest request);

    TokenResponse login(LoginRequest request);

    UserResponse getCurrentUser(Long userId);

    PageResult<UserResponse> getUserList(int page, int size, String keyword);

    UserResponse getUserById(Long id);

    UserResponse updateUser(Long id, UpdateUserRequest request, Long operatorId);
}
