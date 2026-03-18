package com.awsome.shop.points.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("point_balances")
public class PointBalancePO {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private Integer balance;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
