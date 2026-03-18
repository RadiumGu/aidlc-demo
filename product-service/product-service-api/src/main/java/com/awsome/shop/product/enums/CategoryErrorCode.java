package com.awsome.shop.product.enums;

import com.awsome.shop.product.common.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 分类模块错误码
 */
@Getter
@AllArgsConstructor
public enum CategoryErrorCode implements ErrorCode {

    CATEGORY_NOT_FOUND("NOT_FOUND_001", "分类不存在"),
    CATEGORY_LEVEL_EXCEEDED("PARAM_002", "超过分类层级限制（最大2级）"),
    CATEGORY_HAS_CHILDREN("CONFLICT_002", "分类下有子分类，无法删除"),
    CATEGORY_HAS_PRODUCTS("CONFLICT_003", "分类下有产品，无法删除"),
    CATEGORY_PARAM_INVALID("PARAM_003", "分类参数校验失败");

    private final String code;
    private final String message;
}
