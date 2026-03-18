package com.awsome.shop.points.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PointTransactionResponse {
    private Long id;
    private Long userId;
    private String type;
    private Integer amount;
    private Integer balanceAfter;
    private Long referenceId;
    private Long operatorId;
    private String remark;
    private LocalDateTime createdAt;
}
