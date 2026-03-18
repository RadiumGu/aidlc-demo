package com.awsome.shop.point.repository.mysql.po.points;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 积分流水持久化对象
 */
@Data
@TableName("t_points_transaction")
public class PointsTransactionPO {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long employeeId;

    private String type;

    private Long amount;

    private Long balanceAfter;

    private String orderId;

    private Long operatorId;

    private String remark;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
