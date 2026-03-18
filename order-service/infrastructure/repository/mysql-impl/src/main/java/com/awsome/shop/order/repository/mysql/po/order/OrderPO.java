package com.awsome.shop.order.repository.mysql.po.order;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 订单持久化对象
 */
@Data
@TableName("t_order")
public class OrderPO {

    @TableId(type = IdType.AUTO)
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

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    @TableField(fill = FieldFill.INSERT)
    private Long createdBy;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Long updatedBy;

    @TableLogic
    @TableField(fill = FieldFill.INSERT)
    private Integer deleted;

    @Version
    @TableField(fill = FieldFill.INSERT)
    private Integer version;
}
