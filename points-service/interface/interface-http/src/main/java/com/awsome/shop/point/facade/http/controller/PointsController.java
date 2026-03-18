package com.awsome.shop.point.facade.http.controller;

import com.awsome.shop.point.application.api.dto.points.PointsBalanceDTO;
import com.awsome.shop.point.application.api.dto.points.PointsTransactionDTO;
import com.awsome.shop.point.application.api.dto.points.request.ListTransactionsRequest;
import com.awsome.shop.point.application.api.service.points.PointsApplicationService;
import com.awsome.shop.point.common.dto.PageResult;
import com.awsome.shop.point.facade.http.response.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 积分查询 Controller（员工使用）
 */
@Tag(name = "Points", description = "积分查询")
@RestController
@RequestMapping("/api/v1/points")
@RequiredArgsConstructor
public class PointsController {

    private final PointsApplicationService pointsApplicationService;

    @Operation(summary = "查询积分余额")
    @GetMapping("/balance")
    public Result<PointsBalanceDTO> getBalance(@RequestHeader("X-Operator-Id") Long operatorId) {
        return Result.success(pointsApplicationService.getBalance(operatorId));
    }

    @Operation(summary = "查询积分流水")
    @PostMapping("/transactions")
    public Result<PageResult<PointsTransactionDTO>> getTransactions(
            @RequestHeader("X-Operator-Id") Long operatorId,
            @RequestBody @Valid ListTransactionsRequest request) {
        request.setEmployeeId(operatorId);
        return Result.success(pointsApplicationService.getTransactions(request));
    }
}
