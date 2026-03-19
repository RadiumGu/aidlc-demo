package com.awsome.shop.auth.interfaces.http;

import com.awsome.shop.auth.application.dto.UpdateUserRequest;
import com.awsome.shop.auth.application.dto.UserResponse;
import com.awsome.shop.auth.application.dto.StatsResponse;
import com.awsome.shop.auth.application.service.AuthAppService;
import com.awsome.shop.auth.common.dto.PageResult;
import com.awsome.shop.auth.common.result.Result;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 管理员用户管理控制器
 */
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AuthAppService authAppService;

    /**
     * 用户列表（分页 + 搜索）
     */
    @GetMapping
    public Result<PageResult<UserResponse>> getUserList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword) {
        return Result.success(authAppService.getUserList(page, size, keyword));
    }

    /**
     * 获取用户详情
     */
    @GetMapping("/{id}")
    public Result<UserResponse> getUserById(@PathVariable Long id) {
        return Result.success(authAppService.getUserById(id));
    }

    /**
     * 更新用户信息/状态
     */
    @PutMapping("/{id}")
    public Result<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request,
            @RequestHeader("X-User-Id") Long operatorId) {
        return Result.success(authAppService.updateUser(id, request, operatorId));
    }

    @GetMapping("/stats")
    public Result<StatsResponse> stats() {
        return Result.success(authAppService.getStats());
    }
}
