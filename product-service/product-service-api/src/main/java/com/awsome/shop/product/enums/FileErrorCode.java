package com.awsome.shop.product.enums;

import com.awsome.shop.product.common.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 文件模块错误码
 */
@Getter
@AllArgsConstructor
public enum FileErrorCode implements ErrorCode {

    FILE_EMPTY("PARAM_004", "文件为空"),
    FILE_TOO_LARGE("PARAM_005", "文件大小超过限制"),
    FILE_TYPE_NOT_SUPPORTED("PARAM_006", "不支持的文件类型");

    private final String code;
    private final String message;
}
