package com.awsome.shop.product.application.api.dto.product.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 更新商品状态请求
 */
@Data
public class UpdateStatusRequest {

    @NotNull(message = "商品ID不能为空")
    private Long id;

    @NotNull(message = "状态不能为空")
    private Integer status;
}
