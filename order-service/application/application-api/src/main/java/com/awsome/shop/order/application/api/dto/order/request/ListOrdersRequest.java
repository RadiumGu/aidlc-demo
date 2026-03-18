package com.awsome.shop.order.application.api.dto.order.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

/**
 * 订单列表查询请求
 */
@Data
public class ListOrdersRequest {

    private Long employeeId;

    private String status;

    @Min(value = 1, message = "页码最小为 1")
    private Integer pageNum = 1;

    @Min(value = 1, message = "每页大小最小为 1")
    @Max(value = 100, message = "每页大小最大为 100")
    private Integer pageSize = 20;
}
