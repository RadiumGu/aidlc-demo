package com.awsome.shop.product.dto;

import lombok.Data;

@Data
public class CategoryResponse {
    private Long id;
    private String name;
    private Long parentId;
    private Integer sortOrder;
}
