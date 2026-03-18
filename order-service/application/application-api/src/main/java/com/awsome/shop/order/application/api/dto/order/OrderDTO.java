package com.awsome.shop.order.application.api.dto.order;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 订单数据传输对象
 */
@Data
public class OrderDTO {

    private Long id;

    private String orderNo;

    private Long employeeId;

    private Long productId;

    private String productName;

    private String productImage;

    private BigDecimal pointsCost;

    private Integer quantity;

    private BigDecimal totalPoints;

    private String status;

    private String statusDesc;

    private String remark;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
