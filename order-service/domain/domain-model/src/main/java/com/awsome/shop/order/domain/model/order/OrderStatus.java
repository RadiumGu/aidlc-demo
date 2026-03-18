package com.awsome.shop.order.domain.model.order;

/**
 * 订单状态枚举
 */
public enum OrderStatus {

    PENDING("待处理"),
    TO_SHIP("待发货"),
    SHIPPED("已发货"),
    COMPLETED("已完成"),
    CANCELLED("已取消");

    private final String description;

    OrderStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
