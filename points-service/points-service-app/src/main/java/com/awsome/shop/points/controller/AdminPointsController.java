package com.awsome.shop.points.controller;

import com.awsome.shop.points.common.PageResult;
import com.awsome.shop.points.common.Result;
import com.awsome.shop.points.dto.*;
import com.awsome.shop.points.service.ConfigService;
import com.awsome.shop.points.service.PointsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 管理员积分管理端点
 */
@RestController
@RequestMapping("/api/admin/points")
@RequiredArgsConstructor
public class AdminPointsController {

    private final PointsService pointsService;
    private final ConfigService configService;

    @GetMapping("/balances")
    public Result<PageResult<UserPointResponse>> getBalances(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword) {
        size = Math.max(1, Math.min(size, 100));
        page = Math.max(0, page);
        return Result.success(pointsService.getAdminBalances(page, size, keyword));
    }

    @GetMapping("/transactions/{userId}")
    public Result<PageResult<PointTransactionResponse>> getTransactions(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String type) {
        size = Math.max(1, Math.min(size, 100));
        page = Math.max(0, page);
        return Result.success(pointsService.getAdminTransactions(userId, page, size, type));
    }

    @PostMapping("/adjust")
    public Result<PointTransactionResponse> adjustPoints(
            @RequestHeader("X-User-Id") Long operatorId,
            @Valid @RequestBody AdjustPointsRequest request) {
        return Result.success(pointsService.adjustPoints(request, operatorId));
    }

    @GetMapping("/config")
    public Result<DistributionConfigResponse> getConfig() {
        return Result.success(configService.getDistributionConfig());
    }

    @PutMapping("/config")
    public Result<DistributionConfigResponse> updateConfig(
            @Valid @RequestBody UpdateDistributionConfigRequest request) {
        return Result.success(configService.updateDistributionConfig(request));
    }

    @GetMapping("/stats")
    public Result<StatsResponse> stats() {
        return Result.success(pointsService.getStats());
    }
}
