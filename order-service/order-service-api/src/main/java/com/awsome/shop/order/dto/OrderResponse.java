package com.awsome.shop.order.dto;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 兑换订单响应
 */
@Data
public class OrderResponse {

    private Long id;
    private Long userId;
    private Long productId;
    private String productName;
    private String productImageUrl;
    private Integer pointsCost;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
