package com.awsome.shop.point.application.api.dto.points;

import lombok.Data;

/**
 * 积分余额 DTO
 */
@Data
public class PointsBalanceDTO {

    private Long employeeId;

    private Long balance;

    private Long totalEarned;

    private Long totalSpent;
}
