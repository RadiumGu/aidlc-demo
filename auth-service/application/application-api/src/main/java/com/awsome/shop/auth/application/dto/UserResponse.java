package com.awsome.shop.auth.application.dto;

import lombok.Builder;
import lombok.Data;

/**
 * 用户信息响应 DTO
 */
@Data
@Builder
public class UserResponse {

    private Long id;
    private String username;
    private String name;
    private String employeeId;
    private String role;
    private String status;
    private String createdAt;
}
