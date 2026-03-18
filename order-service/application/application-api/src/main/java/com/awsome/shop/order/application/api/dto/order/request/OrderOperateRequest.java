package com.awsome.shop.order.application.api.dto.order.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 订单操作请求（发货/完成）
 */
@Data
public class OrderOperateRequest {

    @NotNull(message = "订单ID不能为空")
    private Long orderId;
}
