package com.awsome.shop.order.application.api.dto.order.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 取消订单请求
 */
@Data
public class CancelOrderRequest {

    @NotNull(message = "订单ID不能为空")
    private Long orderId;

    private String reason;
}
