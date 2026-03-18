package com.awsome.shop.points.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdjustPointsRequest {

    @NotNull(message = "用户ID不能为空")
    @Min(value = 1, message = "用户ID必须大于0")
    private Long userId;

    @NotNull(message = "调整数量不能为空")
    private Integer amount;

    @NotBlank(message = "备注不能为空")
    @Size(max = 500, message = "备注最长500字符")
    private String remark;
}
