package com.awsome.shop.order.common.enums;

/**
 * 订单业务错误码
 */
public enum OrderErrorCode implements ErrorCode {

    ORDER_NOT_FOUND("NOT_FOUND_010", "订单不存在"),
    ORDER_NOT_OWNED("AUTHZ_010", "无权操作此订单"),
    ORDER_STATUS_INVALID("BIZ_010", "当前订单状态不允许此操作"),
    ORDER_CANCEL_NOT_ALLOWED("BIZ_011", "已完成或已取消的订单不能取消"),
    PRODUCT_SERVICE_ERROR("BIZ_012", "商品服务调用失败"),
    POINTS_SERVICE_ERROR("BIZ_013", "积分服务调用失败"),
    INSUFFICIENT_POINTS("BIZ_014", "积分不足"),
    INSUFFICIENT_STOCK("BIZ_015", "库存不足"),
    PRODUCT_NOT_FOUND("NOT_FOUND_011", "商品不存在");

    private final String code;
    private final String message;

    OrderErrorCode(String code, String message) {
        this.code = code;
        this.message = message;
    }

    @Override
    public String getCode() {
        return code;
    }

    @Override
    public String getMessage() {
        return message;
    }
}
