package com.awsome.shop.auth.domain.service;

import com.awsome.shop.auth.domain.model.User;

/**
 * 认证领域服务接口
 */
public interface AuthService {

    /**
     * 用户注册
     *
     * @param user 用户信息（username, password明文, name, employeeId）
     * @return 创建后的用户（含ID，密码已加密）
     */
    User register(User user);

    /**
     * 用户登录
     *
     * @param username 用户名
     * @param password 明文密码
     * @return 验证通过的用户
     */
    User login(String username, String password);
}
