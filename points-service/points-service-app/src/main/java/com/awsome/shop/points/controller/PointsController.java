package com.awsome.shop.points.controller;

import com.awsome.shop.points.common.PageResult;
import com.awsome.shop.points.common.Result;
import com.awsome.shop.points.dto.PointBalanceResponse;
import com.awsome.shop.points.dto.PointTransactionResponse;
import com.awsome.shop.points.service.PointsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 员工积分端点
 */
@RestController
@RequestMapping("/api/points")
@RequiredArgsConstructor
public class PointsController {

    private final PointsService pointsService;

    @GetMapping("/balance")
    public Result<PointBalanceResponse> getBalance(
            @RequestHeader("X-User-Id") Long userId) {
        return Result.success(pointsService.getBalance(userId));
    }

    @GetMapping("/transactions")
    public Result<PageResult<PointTransactionResponse>> getTransactions(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        size = Math.max(1, Math.min(size, 100));
        page = Math.max(0, page);
        return Result.success(pointsService.getTransactions(userId, page, size));
    }
}
