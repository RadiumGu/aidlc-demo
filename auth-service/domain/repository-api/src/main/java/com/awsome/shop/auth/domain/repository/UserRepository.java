package com.awsome.shop.auth.domain.repository;

import com.awsome.shop.auth.common.dto.PageResult;
import com.awsome.shop.auth.domain.model.User;

/**
 * 用户仓储接口（领域层端口）
 */
public interface UserRepository {

    /**
     * 根据 ID 查询用户
     */
    User findById(Long id);

    /**
     * 根据用户名查询用户
     */
    User findByUsername(String username);

    /**
     * 根据工号查询用户
     */
    User findByEmployeeId(String employeeId);

    /**
     * 保存用户（新增）
     */
    User save(User user);

    /**
     * 更新用户
     */
    void update(User user);

    /**
     * 分页查询用户列表
     *
     * @param page    页码（从 0 开始）
     * @param size    每页数量
     * @param keyword 搜索关键词（模糊匹配 username、name、employeeId）
     */
    PageResult<User> findPage(int page, int size, String keyword);

    /**
     * 统计用户总数
     */
    long countAll();

    /**
     * 统计指定时间之后创建的用户数
     */
    long countCreatedSince(java.time.LocalDateTime since);
}
