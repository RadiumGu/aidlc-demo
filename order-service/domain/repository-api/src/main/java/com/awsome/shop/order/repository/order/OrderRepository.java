package com.awsome.shop.order.repository.order;

import com.awsome.shop.order.common.dto.PageResult;
import com.awsome.shop.order.domain.model.order.OrderEntity;
import com.awsome.shop.order.domain.model.order.OrderStatus;

/**
 * 订单仓储接口
 */
public interface OrderRepository {

    OrderEntity getById(Long id);

    PageResult<OrderEntity> page(int page, int size, Long employeeId, OrderStatus status);

    void save(OrderEntity entity);

    void update(OrderEntity entity);
}
