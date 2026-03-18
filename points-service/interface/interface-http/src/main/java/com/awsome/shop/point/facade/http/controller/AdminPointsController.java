package com.awsome.shop.point.facade.http.controller;

import com.awsome.shop.point.application.api.dto.points.request.AddPointsRequest;
import com.awsome.shop.point.application.api.dto.points.request.DeductPointsRequest;
import com.awsome.shop.point.application.api.service.points.PointsApplicationService;
import com.awsome.shop.point.facade.http.response.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 积分管理 Controller（管理员使用）
 */
@Tag(name = "Admin Points", description = "积分管理（管理员）")
@RestController
@RequestMapping("/api/v1/admin/points")
@RequiredArgsConstructor
public class AdminPointsController {

    private final PointsApplicationService pointsApplicationService;

    @Operation(summary = "发放积分")
    @PostMapping("/add")
    public Result<Void> addPoints(
            @RequestHeader("X-Operator-Id") Long operatorId,
            @RequestBody @Valid AddPointsRequest request) {
        pointsApplicationService.adminAdd(request, operatorId);
        return Result.success();
    }

    @Operation(summary = "扣除积分")
    @PostMapping("/deduct")
    public Result<Void> deductPoints(
            @RequestHeader("X-Operator-Id") Long operatorId,
            @RequestBody @Valid DeductPointsRequest request) {
        pointsApplicationService.adminDeduct(request, operatorId);
        return Result.success();
    }
}
