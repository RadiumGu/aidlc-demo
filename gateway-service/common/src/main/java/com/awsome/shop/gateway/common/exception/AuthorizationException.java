package com.awsome.shop.gateway.common.exception;

import com.awsome.shop.gateway.common.enums.ErrorCode;

/**
 * Authorization exception (HTTP 403)
 */
public class AuthorizationException extends GatewayException {

    public AuthorizationException(ErrorCode errorCode) {
        super(errorCode);
    }

    public AuthorizationException(ErrorCode errorCode, String customMessage) {
        super(errorCode, customMessage);
    }

    public AuthorizationException(ErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
    }
}
