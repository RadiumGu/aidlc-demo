package com.awsome.shop.auth.domain.service;

import com.awsome.shop.auth.common.dto.PageResult;
import com.awsome.shop.auth.domain.model.User;
import com.awsome.shop.auth.domain.model.enums.UserStatus;

/**
 * 用户领域服务接口
 */
public interface UserService {

    /**
     * 根据 ID 获取用户
     */
    User getUserById(Long id);

    /**
     * 分页查询用户列表
     */
    PageResult<User> getUserList(int page, int size, String keyword);

    /**
     * 更新用户信息/状态
     *
     * @param id         目标用户ID
     * @param name       姓名（可选）
     * @param status     状态（可选）
     * @param operatorId 操作者ID（用于校验不能禁用自己）
     * @return 更新后的用户
     */
    User updateUser(Long id, String name, UserStatus status, Long operatorId);
}
