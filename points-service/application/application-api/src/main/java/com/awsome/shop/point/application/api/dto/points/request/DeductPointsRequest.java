package com.awsome.shop.point.application.api.dto.points.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 扣除积分请求
 */
@Data
public class DeductPointsRequest {

    @NotNull(message = "员工ID不能为空")
    private Long employeeId;

    @NotNull(message = "积分数量不能为空")
    @Min(value = 1, message = "积分数量最小为 1")
    private Long amount;

    private String remark;
}
