package com.awsome.shop.points.model;

import com.awsome.shop.points.enums.TransactionType;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("point_transactions")
public class PointTransactionPO {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private TransactionType type;
    private Integer amount;
    private Integer balanceAfter;
    private Long referenceId;
    private Long operatorId;
    private String remark;
    private LocalDateTime createdAt;
}
