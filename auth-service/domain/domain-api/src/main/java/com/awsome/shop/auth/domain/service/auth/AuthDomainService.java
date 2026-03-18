package com.awsome.shop.auth.domain.service.auth;

import com.awsome.shop.auth.domain.model.user.UserEntity;

/**
 * 认证领域服务接口
 */
public interface AuthDomainService {

    /**
     * 用户认证（验证用户名密码）
     *
     * @param username 用户名
     * @param password 明文密码
     * @return 认证成功的用户实体
     */
    UserEntity authenticate(String username, String password);

    /**
     * 根据ID查询用户
     */
    UserEntity getUserById(Long userId);
}
