package com.awsome.shop.product.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateProductRequest {

    @NotBlank(message = "产品名称不能为空")
    @Size(max = 200, message = "产品名称最多200个字符")
    private String name;

    @Size(max = 5000, message = "产品描述最多5000个字符")
    private String description;

    @NotNull(message = "积分价格不能为空")
    @Min(value = 1, message = "积分价格最小为1")
    private Integer pointsPrice;

    @NotNull(message = "库存不能为空")
    @Min(value = 0, message = "库存不能为负数")
    private Integer stock;

    @Size(max = 500, message = "图片URL最多500个字符")
    private String imageUrl;

    @NotNull(message = "分类ID不能为空")
    private Long categoryId;
}
