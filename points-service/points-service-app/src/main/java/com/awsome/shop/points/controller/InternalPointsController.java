package com.awsome.shop.points.controller;

import com.awsome.shop.points.common.Result;
import com.awsome.shop.points.dto.*;
import com.awsome.shop.points.service.PointsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 内部接口端点（服务间调用）
 */
@RestController
@RequestMapping("/api/internal/points")
@RequiredArgsConstructor
public class InternalPointsController {

    private final PointsService pointsService;

    @PostMapping("/init")
    public Result<PointBalanceResponse> initPoints(
            @Valid @RequestBody InitPointsRequest request) {
        return Result.success(pointsService.initPoints(request));
    }

    @PostMapping("/deduct")
    public Result<PointTransactionResponse> deductPoints(
            @Valid @RequestBody DeductPointsRequest request) {
        return Result.success(pointsService.deductPoints(request));
    }

    @PostMapping("/rollback")
    public Result<Void> rollbackDeduction(
            @Valid @RequestBody RollbackDeductionRequest request) {
        pointsService.rollbackDeduction(request);
        return Result.success();
    }

    @GetMapping("/balance/{userId}")
    public Result<PointBalanceResponse> getBalance(@PathVariable Long userId) {
        return Result.success(pointsService.getBalanceByUserId(userId));
    }
}
