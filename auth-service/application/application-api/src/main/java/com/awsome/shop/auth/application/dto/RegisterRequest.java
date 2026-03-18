package com.awsome.shop.auth.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 注册请求 DTO
 */
@Data
public class RegisterRequest {

    @NotBlank(message = "用户名不能为空")
    @Pattern(regexp = "^[a-zA-Z0-9_]{3,20}$", message = "用户名只能包含字母、数字、下划线，长度3-20位")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 128, message = "密码长度6-128位")
    private String password;

    @NotBlank(message = "姓名不能为空")
    @Size(min = 1, max = 100, message = "姓名长度1-100位")
    private String name;

    @NotBlank(message = "工号不能为空")
    @Size(min = 1, max = 50, message = "工号长度1-50位")
    private String employeeId;
}
