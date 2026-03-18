package com.awsome.shop.order.facade.http.controller;

import com.awsome.shop.order.application.api.dto.order.OrderDTO;
import com.awsome.shop.order.application.api.dto.order.request.*;
import com.awsome.shop.order.application.api.service.order.OrderApplicationService;
import com.awsome.shop.order.common.dto.PageResult;
import com.awsome.shop.order.common.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 订单 Controller — 员工操作
 */
@Tag(name = "Order", description = "员工订单操作")
@RestController
@RequestMapping("/api/v1/order")
@RequiredArgsConstructor
public class OrderController {

    private final OrderApplicationService orderApplicationService;

    @Operation(summary = "创建兑换订单")
    @PostMapping("/create")
    public Result<OrderDTO> create(@RequestBody @Valid CreateOrderRequest request,
                                   @RequestHeader("X-Operator-Id") Long employeeId) {
        return Result.success(orderApplicationService.createOrder(request, employeeId));
    }

    @Operation(summary = "我的订单列表")
    @PostMapping("/list")
    public Result<PageResult<OrderDTO>> list(@RequestBody @Valid ListOrdersRequest request,
                                             @RequestHeader("X-Operator-Id") Long employeeId) {
        request.setEmployeeId(employeeId);
        return Result.success(orderApplicationService.listOrders(request));
    }

    @Operation(summary = "订单详情")
    @GetMapping("/{id}")
    public Result<OrderDTO> get(@PathVariable Long id) {
        return Result.success(orderApplicationService.getOrder(id));
    }

    @Operation(summary = "取消订单")
    @PostMapping("/cancel")
    public Result<Void> cancel(@RequestBody @Valid CancelOrderRequest request,
                               @RequestHeader("X-Operator-Id") Long employeeId) {
        orderApplicationService.cancelOrder(request, employeeId);
        return Result.success();
    }
}
