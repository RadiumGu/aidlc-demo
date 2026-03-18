package com.awsome.shop.order.facade.http.controller;

import com.awsome.shop.order.application.api.dto.order.OrderDTO;
import com.awsome.shop.order.application.api.dto.order.request.ListOrdersRequest;
import com.awsome.shop.order.application.api.dto.order.request.OrderOperateRequest;
import com.awsome.shop.order.application.api.service.order.OrderApplicationService;
import com.awsome.shop.order.common.dto.PageResult;
import com.awsome.shop.order.common.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 管理员订单 Controller
 */
@Tag(name = "Admin Order", description = "管理员订单操作")
@RestController
@RequestMapping("/api/v1/admin/order")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderApplicationService orderApplicationService;

    @Operation(summary = "所有订单列表")
    @PostMapping("/list")
    public Result<PageResult<OrderDTO>> list(@RequestBody @Valid ListOrdersRequest request) {
        return Result.success(orderApplicationService.listOrders(request));
    }

    @Operation(summary = "发货")
    @PostMapping("/ship")
    public Result<Void> ship(@RequestBody @Valid OrderOperateRequest request) {
        orderApplicationService.shipOrder(request.getOrderId());
        return Result.success();
    }

    @Operation(summary = "确认完成")
    @PostMapping("/complete")
    public Result<Void> complete(@RequestBody @Valid OrderOperateRequest request) {
        orderApplicationService.completeOrder(request.getOrderId());
        return Result.success();
    }
}
