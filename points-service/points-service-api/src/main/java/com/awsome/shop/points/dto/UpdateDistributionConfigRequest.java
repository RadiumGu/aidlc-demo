package com.awsome.shop.points.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateDistributionConfigRequest {

    @NotNull(message = "发放额度不能为空")
    @Min(value = 1, message = "发放额度必须大于0")
    private Integer amount;
}
