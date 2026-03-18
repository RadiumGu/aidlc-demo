package com.awsome.shop.product.enums;

import com.awsome.shop.product.common.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 产品模块错误码
 */
@Getter
@AllArgsConstructor
public enum ProductErrorCode implements ErrorCode {

    CATEGORY_NOT_FOUND("NOT_FOUND_001", "分类不存在"),
    PRODUCT_NOT_FOUND("NOT_FOUND_002", "产品不存在"),
    STOCK_INSUFFICIENT("CONFLICT_001", "库存不足"),
    PRODUCT_PARAM_INVALID("PARAM_001", "产品参数校验失败");

    private final String code;
    private final String message;
}
