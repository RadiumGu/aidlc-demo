package com.awsome.shop.points.dto;

import lombok.Data;

@Data
public class PointBalanceResponse {
    private Long userId;
    private Integer balance;
}
