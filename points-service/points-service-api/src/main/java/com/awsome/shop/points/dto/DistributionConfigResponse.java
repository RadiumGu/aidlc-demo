package com.awsome.shop.points.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DistributionConfigResponse {
    private Integer amount;
    private LocalDateTime updatedAt;
}
