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
    private String username;
    private Long productId;
    private String productName;
    private String productImageUrl;
    private Integer pointsCost;
    private String status;
    private String receiverName;
    private String receiverPhone;
    private String receiverAddress;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
