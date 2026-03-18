package com.awsome.shop.auth.application.api.dto.auth;

import lombok.Data;

/**
 * 用户信息 DTO
 */
@Data
public class UserDTO {

    private Long id;

    private String username;

    private String displayName;

    private String role;

    private String avatar;

    private String status;
}
