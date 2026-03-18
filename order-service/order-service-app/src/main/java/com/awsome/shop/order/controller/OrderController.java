package com.awsome.shop.order.controller;

import com.awsome.shop.order.common.PageResult;
import com.awsome.shop.order.common.Result;
import com.awsome.shop.order.dto.CreateOrderRequest;
import com.awsome.shop.order.dto.OrderResponse;
import com.awsome.shop.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 员工兑换端点
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * 创建兑换订单
     */
    @PostMapping
    public Result<OrderResponse> createOrder(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody CreateOrderRequest request) {
        OrderResponse response = orderService.createOrder(userId, request.getProductId());
        return Result.success(response);
    }

    /**
     * 查询当前用户兑换历史（分页）
     */
    @GetMapping
    public Result<PageResult<OrderResponse>> getMyOrders(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        size = Math.max(1, Math.min(size, 100));
        page = Math.max(0, page);
        PageResult<OrderResponse> result = orderService.getMyOrders(userId, page, size);
        return Result.success(result);
    }

    /**
     * 查询兑换详情
     */
    @GetMapping("/{id}")
    public Result<OrderResponse> getOrderDetail(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id) {
        OrderResponse response = orderService.getOrderDetail(userId, id);
        return Result.success(response);
    }
}
