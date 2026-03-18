package com.awsome.shop.point.domain.model.points;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 积分流水领域实体
 */
@Data
public class PointsTransactionEntity {

    private Long id;

    private Long employeeId;

    private PointsTransactionType type;

    private Long amount;

    private Long balanceAfter;

    private String orderId;

    private Long operatorId;

    private String remark;

    private LocalDateTime createdAt;
}
