package com.awsome.shop.product.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateCategoryRequest {

    @Size(min = 1, max = 100, message = "分类名称1-100个字符")
    private String name;

    private Long parentId;

    private Integer sortOrder;
}
