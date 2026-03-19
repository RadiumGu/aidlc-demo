package com.awsome.shop.product.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProductRequest {

    @Size(min = 1, max = 200, message = "产品名称1-200个字符")
    private String name;

    @Size(max = 5000, message = "产品描述最多5000个字符")
    private String description;

    @Min(value = 1, message = "积分价格最小为1")
    private Integer pointsPrice;

    @Min(value = 0, message = "库存不能为负数")
    private Integer stock;

    @Size(max = 500, message = "图片URL最多500个字符")
    private String imageUrl;

    private Long categoryId;

    private String status;
}
