package com.awsome.shop.points.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StatsResponse {
    private long monthDistributed;
}
