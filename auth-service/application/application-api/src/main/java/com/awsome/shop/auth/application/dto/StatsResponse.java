package com.awsome.shop.auth.application.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StatsResponse {
    private long total;
    private long monthNew;
}
