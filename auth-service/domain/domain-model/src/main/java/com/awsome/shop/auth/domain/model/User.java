package com.awsome.shop.auth.domain.model;

import com.awsome.shop.auth.domain.model.enums.Role;
import com.awsome.shop.auth.domain.model.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 用户领域实体
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    /** 用户唯一标识 */
    private Long id;

    /** 用户名（唯一，3-20位，字母数字下划线） */
    private String username;

    /** 密码（bcrypt 加密存储） */
    private String password;

    /** 姓名 */
    private String name;

    /** 工号（唯一） */
    private String employeeId;

    /** 角色 */
    private Role role;

    /** 账号状态 */
    private UserStatus status;

    /** 创建时间 */
    private LocalDateTime createdAt;

    /** 更新时间 */
    private LocalDateTime updatedAt;
}
