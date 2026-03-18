package com.awsome.shop.point.application.api.dto.points;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 积分流水 DTO
 */
@Data
public class PointsTransactionDTO {

    private Long id;

    private Long employeeId;

    private String type;

    private Long amount;

    private Long balanceAfter;

    private String orderId;

    private Long operatorId;

    private String remark;

    private LocalDateTime createdAt;
}
