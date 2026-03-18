package com.awsome.shop.order.domain.service.order;

import com.awsome.shop.order.common.dto.PageResult;
import com.awsome.shop.order.domain.model.order.OrderEntity;
import com.awsome.shop.order.domain.model.order.OrderStatus;

import java.math.BigDecimal;

/**
 * 订单领域服务接口
 */
public interface OrderDomainService {

    /**
     * 创建订单
     */
    OrderEntity createOrder(Long employeeId, Long productId, String productName,
                            String productImage, BigDecimal pointsCost, Integer quantity,
                            BigDecimal totalPoints);

    /**
     * 取消订单
     */
    void cancelOrder(Long orderId, String reason);

    /**
     * 发货
     */
    void shipOrder(Long orderId);

    /**
     * 确认完成
     */
    void completeOrder(Long orderId);

    /**
     * 根据ID查询
     */
    OrderEntity getById(Long id);

    /**
     * 分页查询
     */
    PageResult<OrderEntity> page(int page, int size, Long employeeId, OrderStatus status);
}
