package com.awsome.shop.auth.interfaces.http;

import com.awsome.shop.auth.application.dto.UserResponse;
import com.awsome.shop.auth.application.service.AuthAppService;
import com.awsome.shop.auth.common.result.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 用户控制器（认证用户端点）
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final AuthAppService authAppService;

    /**
     * 获取当前用户信息
     * API 网关校验 JWT 后，将 userId 附加到请求头 X-User-Id
     */
    @GetMapping("/me")
    public Result<UserResponse> getCurrentUser(
            @RequestHeader("X-User-Id") Long userId) {
        return Result.success(authAppService.getCurrentUser(userId));
    }
}
