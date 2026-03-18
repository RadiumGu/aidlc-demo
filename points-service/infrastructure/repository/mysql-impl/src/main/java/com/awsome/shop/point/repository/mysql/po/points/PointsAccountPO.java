package com.awsome.shop.point.repository.mysql.po.points;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 积分账户持久化对象
 */
@Data
@TableName("t_points_account")
public class PointsAccountPO {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long employeeId;

    private Long balance;

    private Long totalEarned;

    private Long totalSpent;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
