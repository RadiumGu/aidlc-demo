package com.awsome.shop.product.dto;

import lombok.Data;

@Data
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private Integer pointsPrice;
    private Integer stock;
    private String imageUrl;
    private Long categoryId;
    private String categoryName;
    private String status;
    private String createdAt;
}
