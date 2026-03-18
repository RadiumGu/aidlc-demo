package com.awsome.shop.order.domain.model.order;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 订单领域实体
 */
@Data
public class OrderEntity {

    private Long id;

    /** 订单号（唯一） */
    private String orderNo;

    /** 员工ID */
    private Long employeeId;

    /** 商品ID */
    private Long productId;

    /** 商品名称 */
    private String productName;

    /** 商品图片 */
    private String productImage;

    /** 单价积分 */
    private BigDecimal pointsCost;

    /** 数量 */
    private Integer quantity;

    /** 总积分 */
    private BigDecimal totalPoints;

    /** 订单状态 */
    private OrderStatus status;

    /** 备注 */
    private String remark;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
