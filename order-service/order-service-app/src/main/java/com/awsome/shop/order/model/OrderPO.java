package com.awsome.shop.order.model;

import com.awsome.shop.order.enums.OrderStatus;
import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 兑换订单 PO
 */
@Data
@TableName("orders")
public class OrderPO {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private Long productId;

    private String productName;

    private String productImageUrl;

    private Integer pointsCost;

    private Long pointsTransactionId;

    private OrderStatus status;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
