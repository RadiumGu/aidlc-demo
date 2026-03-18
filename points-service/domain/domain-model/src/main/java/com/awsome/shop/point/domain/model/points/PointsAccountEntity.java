package com.awsome.shop.point.domain.model.points;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 积分账户领域实体
 */
@Data
public class PointsAccountEntity {

    private Long id;

    private Long employeeId;

    private Long balance;

    private Long totalEarned;

    private Long totalSpent;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
