package com.awsome.shop.order.dto;

import com.awsome.shop.order.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 更新兑换状态请求
 */
@Data
public class UpdateOrderStatusRequest {

    @NotNull(message = "目标状态不能为空")
    private OrderStatus status;
}
