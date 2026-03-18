package com.awsome.shop.order.enums;

import com.awsome.shop.order.common.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 兑换订单错误码
 */
@Getter
@AllArgsConstructor
public enum OrderErrorCode implements ErrorCode {

    PRODUCT_NOT_FOUND("ORDER_001", 404, "产品不存在"),
    PRODUCT_INACTIVE("ORDER_002", 400, "产品已下架"),
    STOCK_INSUFFICIENT("ORDER_003", 400, "库存不足"),
    POINTS_ACCOUNT_NOT_FOUND("ORDER_004", 400, "积分账户不存在"),
    POINTS_INSUFFICIENT("ORDER_005", 400, "积分不足，无法兑换"),
    ORDER_NOT_FOUND("ORDER_006", 404, "兑换记录不存在"),
    ORDER_ACCESS_DENIED("ORDER_007", 403, "无权查看此兑换记录"),
    ORDER_PROCESS_FAILED("ORDER_008", 500, "兑换处理失败，请稍后重试"),
    INVALID_STATUS_TRANSITION("ORDER_009", 400, "非法状态变更"),
    CANCEL_REFUND_FAILED("ORDER_010", 500, "取消退还处理异常");

    private final String code;
    private final int httpStatus;
    private final String message;
}
