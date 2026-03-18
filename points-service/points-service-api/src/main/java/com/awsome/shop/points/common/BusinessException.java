package com.awsome.shop.points.common;

import lombok.Getter;
import java.text.MessageFormat;

/**
 * 业务异常
 */
@Getter
public class BusinessException extends RuntimeException {

    private final String errorCode;
    private final String errorMessage;

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode.getCode();
        this.errorMessage = errorCode.getMessage();
    }

    public BusinessException(ErrorCode errorCode, String customMessage) {
        super(customMessage);
        this.errorCode = errorCode.getCode();
        this.errorMessage = customMessage;
    }

    public BusinessException(ErrorCode errorCode, Object... args) {
        super(formatMessage(errorCode.getMessage(), args));
        this.errorCode = errorCode.getCode();
        this.errorMessage = formatMessage(errorCode.getMessage(), args);
    }

    public BusinessException(String errorCode, String errorMessage) {
        super(errorMessage);
        this.errorCode = errorCode;
        this.errorMessage = errorMessage;
    }

    private static String formatMessage(String template, Object... args) {
        if (args == null || args.length == 0) return template;
        try {
            return MessageFormat.format(template, args);
        } catch (Exception e) {
            return template;
        }
    }
}
