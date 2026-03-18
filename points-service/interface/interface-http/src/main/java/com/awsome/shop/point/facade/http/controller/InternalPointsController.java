package com.awsome.shop.point.facade.http.controller;

import com.awsome.shop.point.application.api.dto.points.request.OrderDeductRequest;
import com.awsome.shop.point.application.api.dto.points.request.OrderRefundRequest;
import com.awsome.shop.point.application.api.service.points.PointsApplicationService;
import com.awsome.shop.point.facade.http.response.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 积分内部接口 Controller（Order Service 调用）
 */
@Tag(name = "Internal Points", description = "积分内部接口")
@RestController
@RequestMapping("/api/v1/internal/points")
@RequiredArgsConstructor
public class InternalPointsController {

    private final PointsApplicationService pointsApplicationService;

    @Operation(summary = "订单扣减积分")
    @PostMapping("/deduct")
    public Result<Boolean> deductForOrder(@RequestBody @Valid OrderDeductRequest request) {
        boolean success = pointsApplicationService.deductForOrder(request);
        return Result.success(success);
    }

    @Operation(summary = "订单退还积分")
    @PostMapping("/refund")
    public Result<Void> refundForOrder(@RequestBody @Valid OrderRefundRequest request) {
        pointsApplicationService.refundForOrder(request);
        return Result.success();
    }
}
