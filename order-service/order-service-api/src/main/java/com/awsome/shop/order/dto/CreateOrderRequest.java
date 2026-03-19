package com.awsome.shop.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 创建兑换订单请求
 */
@Data
public class CreateOrderRequest {

    @NotNull(message = "产品ID不能为空")
    @Min(value = 1, message = "产品ID必须大于0")
    private Long productId;

    private String username;

    private String receiverName;

    private String receiverPhone;

    private String receiverAddress;
}
