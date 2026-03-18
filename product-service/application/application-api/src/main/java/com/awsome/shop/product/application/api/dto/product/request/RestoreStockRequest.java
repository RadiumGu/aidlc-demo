package com.awsome.shop.product.application.api.dto.product.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 库存恢复请求
 */
@Data
public class RestoreStockRequest {

    @NotNull(message = "商品ID不能为空")
    private Long productId;

    @NotNull(message = "恢复数量不能为空")
    @Min(value = 1, message = "恢复数量最小为1")
    private Integer quantity;
}
