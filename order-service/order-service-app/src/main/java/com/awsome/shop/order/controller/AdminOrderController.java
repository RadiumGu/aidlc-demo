package com.awsome.shop.order.controller;

import com.awsome.shop.order.common.PageResult;
import com.awsome.shop.order.common.Result;
import com.awsome.shop.order.dto.OrderResponse;
import com.awsome.shop.order.dto.StatsResponse;
import com.awsome.shop.order.dto.UpdateOrderStatusRequest;
import com.awsome.shop.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 管理员兑换端点
 */
@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    /**
     * 查看所有兑换记录（分页、搜索、时间筛选）
     */
    @GetMapping
    public Result<PageResult<OrderResponse>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        size = Math.max(1, Math.min(size, 100));
        page = Math.max(0, page);
        PageResult<OrderResponse> result = orderService.getAllOrders(page, size, keyword, startDate, endDate);
        return Result.success(result);
    }

    /**
     * 查看兑换详情
     */
    @GetMapping("/{id}")
    public Result<OrderResponse> getOrderById(@PathVariable Long id) {
        OrderResponse response = orderService.getOrderById(id);
        return Result.success(response);
    }

    /**
     * 更新兑换状态
     */
    @PutMapping("/{id}/status")
    public Result<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        OrderResponse response = orderService.updateOrderStatus(id, request.getStatus());
        return Result.success(response);
    }

    @GetMapping("/user-counts")
    public Result<java.util.Map<Long, Long>> getUserOrderCounts() {
        return Result.success(orderService.getUserOrderCounts());
    }

    @GetMapping("/stats")
    public Result<StatsResponse> stats() {
        return Result.success(orderService.getStats());
    }
}
