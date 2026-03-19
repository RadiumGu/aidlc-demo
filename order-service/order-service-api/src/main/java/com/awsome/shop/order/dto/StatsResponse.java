package com.awsome.shop.order.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StatsResponse {
    private long monthOrders;
    private long lastMonthOrders;
}
