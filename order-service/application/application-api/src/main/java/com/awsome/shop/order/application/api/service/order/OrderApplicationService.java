package com.awsome.shop.order.application.api.service.order;

import com.awsome.shop.order.application.api.dto.order.OrderDTO;
import com.awsome.shop.order.application.api.dto.order.request.*;
import com.awsome.shop.order.common.dto.PageResult;

/**
 * 订单应用服务接口
 */
public interface OrderApplicationService {

    /**
     * 创建兑换订单（Saga 编排）
     */
    OrderDTO createOrder(CreateOrderRequest request, Long employeeId);

    /**
     * 取消订单（含补偿）
     */
    void cancelOrder(CancelOrderRequest request, Long employeeId);

    /**
     * 分页查询订单
     */
    PageResult<OrderDTO> listOrders(ListOrdersRequest request);

    /**
     * 查询订单详情
     */
    OrderDTO getOrder(Long orderId);

    /**
     * 发货（管理员操作）
     */
    void shipOrder(Long orderId);

    /**
     * 确认完成（管理员操作）
     */
    void completeOrder(Long orderId);
}
