package com.awsome.shop.auth.application.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 更新用户请求 DTO（管理员）
 */
@Data
public class UpdateUserRequest {

    @Size(min = 1, max = 100, message = "姓名长度1-100位")
    private String name;

    /** ACTIVE 或 DISABLED */
    private String status;
}
