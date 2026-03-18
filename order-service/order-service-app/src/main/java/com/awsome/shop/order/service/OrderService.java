package com.awsome.shop.order.service;

import com.awsome.shop.order.client.PointsServiceClient;
import com.awsome.shop.order.client.ProductServiceClient;
import com.awsome.shop.order.common.BusinessException;
import com.awsome.shop.order.common.PageResult;
import com.awsome.shop.order.dto.OrderResponse;
import com.awsome.shop.order.enums.OrderErrorCode;
import com.awsome.shop.order.enums.OrderStatus;
import com.awsome.shop.order.model.OrderPO;
import com.awsome.shop.order.repository.OrderMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

/**
 * 兑换订单核心业务服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderMapper orderMapper;
    private final ProductServiceClient productServiceClient;
    private final PointsServiceClient pointsServiceClient;

    /**
     * 创建兑换订单（核心流程）
     * 预校验 → 创建订单 → 扣积分 → 扣库存 → 补偿回滚
     */
    @Transactional
    public OrderResponse createOrder(Long userId, Long productId) {
        // === 阶段一：预校验（不加锁，快速拦截） ===
        Map<String, Object> product = productServiceClient.getProduct(productId);
        validateProduct(product);

        int pointsPrice = ((Number) product.get("pointsPrice")).intValue();

        Map<String, Object> balance = pointsServiceClient.getBalance(userId);
        int currentBalance = ((Number) balance.get("balance")).intValue();
        if (currentBalance < pointsPrice) {
            throw new BusinessException(OrderErrorCode.POINTS_INSUFFICIENT);
        }

        // === 阶段二：创建订单记录（status=PENDING） ===
        OrderPO order = new OrderPO();
        order.setUserId(userId);
        order.setProductId(productId);
        order.setProductName((String) product.get("name"));
        order.setProductImageUrl((String) product.get("imageUrl"));
        order.setPointsCost(pointsPrice);
        order.setStatus(OrderStatus.PENDING);
        orderMapper.insert(order);
        Long orderId = order.getId();

        // === 阶段三：顺序扣除（先积分后库存） ===
        Long transactionId;
        try {
            transactionId = pointsServiceClient.deductPoints(userId, pointsPrice, orderId);
        } catch (Exception e) {
            log.error("扣除积分失败，删除订单: orderId={}, error={}", orderId, e.getMessage());
            orderMapper.deleteById(orderId);
            throw e;
        }

        // 保存积分流水ID
        order.setPointsTransactionId(transactionId);
        orderMapper.updateById(order);

        try {
            productServiceClient.deductStock(productId, 1);
        } catch (Exception e) {
            log.error("扣减库存失败，回滚积分: orderId={}, transactionId={}", orderId, transactionId);
            try {
                pointsServiceClient.rollbackDeduction(transactionId);
            } catch (Exception rollbackEx) {
                log.error("积分回滚失败，需人工介入: orderId={}, transactionId={}, error={}",
                        orderId, transactionId, rollbackEx.getMessage());
            }
            orderMapper.deleteById(orderId);
            throw new BusinessException(OrderErrorCode.STOCK_INSUFFICIENT);
        }

        return toResponse(order);
    }

    /**
     * 员工查询自己的兑换历史（分页）
     */
    public PageResult<OrderResponse> getMyOrders(Long userId, int page, int size) {
        Page<OrderPO> pageParam = new Page<>(page + 1, size); // MyBatis-Plus 页码从1开始
        LambdaQueryWrapper<OrderPO> wrapper = new LambdaQueryWrapper<OrderPO>()
                .eq(OrderPO::getUserId, userId)
                .orderByDesc(OrderPO::getCreatedAt);
        Page<OrderPO> result = orderMapper.selectPage(pageParam, wrapper);
        return toPageResult(result);
    }

    /**
     * 员工查询兑换详情（含归属校验）
     */
    public OrderResponse getOrderDetail(Long userId, Long orderId) {
        OrderPO order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException(OrderErrorCode.ORDER_NOT_FOUND);
        }
        if (!order.getUserId().equals(userId)) {
            throw new BusinessException(OrderErrorCode.ORDER_ACCESS_DENIED);
        }
        return toResponse(order);
    }

    /**
     * 管理员查看所有兑换记录（分页、搜索、时间筛选）
     */
    public PageResult<OrderResponse> getAllOrders(int page, int size, String keyword,
                                                  String startDate, String endDate) {
        Page<OrderPO> pageParam = new Page<>(page + 1, size);
        LambdaQueryWrapper<OrderPO> wrapper = new LambdaQueryWrapper<OrderPO>()
                .like(StringUtils.hasText(keyword), OrderPO::getProductName, keyword)
                .ge(StringUtils.hasText(startDate), OrderPO::getCreatedAt, parseStartDate(startDate))
                .le(StringUtils.hasText(endDate), OrderPO::getCreatedAt, parseEndDate(endDate))
                .orderByDesc(OrderPO::getCreatedAt);
        Page<OrderPO> result = orderMapper.selectPage(pageParam, wrapper);
        return toPageResult(result);
    }

    /**
     * 管理员更新兑换状态（含取消自动退还）
     */
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus targetStatus) {
        OrderPO order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new BusinessException(OrderErrorCode.ORDER_NOT_FOUND);
        }

        // 状态流转校验
        if (!order.getStatus().canTransitionTo(targetStatus)) {
            throw new BusinessException(OrderErrorCode.INVALID_STATUS_TRANSITION);
        }

        // 先更新状态
        order.setStatus(targetStatus);
        orderMapper.updateById(order);

        // 取消时自动退还（最大努力）
        if (targetStatus == OrderStatus.CANCELLED) {
            handleCancelRefund(order);
        }

        return toResponse(order);
    }

    /**
     * 取消退还处理 — 回滚积分 + 恢复库存（最大努力，失败记日志不阻塞）
     */
    private void handleCancelRefund(OrderPO order) {
        // 回滚积分
        if (order.getPointsTransactionId() != null) {
            try {
                pointsServiceClient.rollbackDeduction(order.getPointsTransactionId());
                log.info("取消退还-积分回滚成功: orderId={}, transactionId={}", order.getId(), order.getPointsTransactionId());
            } catch (Exception e) {
                log.error("取消退还-积分回滚失败，需人工介入: orderId={}, transactionId={}, error={}",
                        order.getId(), order.getPointsTransactionId(), e.getMessage());
            }
        }

        // 恢复库存
        try {
            productServiceClient.restoreStock(order.getProductId(), 1);
            log.info("取消退还-库存恢复成功: orderId={}, productId={}", order.getId(), order.getProductId());
        } catch (Exception e) {
            log.error("取消退还-库存恢复失败，需人工介入: orderId={}, productId={}, error={}",
                    order.getId(), order.getProductId(), e.getMessage());
        }
    }

    // ========== 私有方法 ==========

    private void validateProduct(Map<String, Object> product) {
        if (product == null || product.isEmpty()) {
            throw new BusinessException(OrderErrorCode.PRODUCT_NOT_FOUND);
        }
        String status = (String) product.get("status");
        if (!"ACTIVE".equals(status)) {
            throw new BusinessException(OrderErrorCode.PRODUCT_INACTIVE);
        }
        int stock = ((Number) product.get("stock")).intValue();
        if (stock <= 0) {
            throw new BusinessException(OrderErrorCode.STOCK_INSUFFICIENT);
        }
    }

    private LocalDateTime parseStartDate(String dateStr) {
        if (!StringUtils.hasText(dateStr)) return null;
        return LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE).atStartOfDay();
    }

    private LocalDateTime parseEndDate(String dateStr) {
        if (!StringUtils.hasText(dateStr)) return null;
        return LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE).atTime(LocalTime.MAX);
    }

    private OrderResponse toResponse(OrderPO po) {
        OrderResponse resp = new OrderResponse();
        resp.setId(po.getId());
        resp.setUserId(po.getUserId());
        resp.setProductId(po.getProductId());
        resp.setProductName(po.getProductName());
        resp.setProductImageUrl(po.getProductImageUrl());
        resp.setPointsCost(po.getPointsCost());
        resp.setStatus(po.getStatus().getValue());
        resp.setCreatedAt(po.getCreatedAt());
        resp.setUpdatedAt(po.getUpdatedAt());
        return resp;
    }

    private PageResult<OrderResponse> toPageResult(Page<OrderPO> page) {
        PageResult<OrderPO> raw = new PageResult<>();
        raw.setCurrent(page.getCurrent());
        raw.setSize(page.getSize());
        raw.setTotal(page.getTotal());
        raw.setPages(page.getPages());
        raw.setRecords(page.getRecords());
        return raw.convert(this::toResponse);
    }
}
