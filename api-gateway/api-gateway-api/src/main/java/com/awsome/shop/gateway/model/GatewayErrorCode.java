package com.awsome.shop.gateway.model;

import lombok.Getter;

@Getter
public enum GatewayErrorCode {

    GW_001(401, "未授权，请先登录"),
    GW_002(403, "权限不足"),
    GW_003(502, "服务暂时不可用"),
    GW_004(504, "请求超时"),
    GW_005(404, "资源不存在");

    private final int httpStatus;
    private final String message;

    GatewayErrorCode(int httpStatus, String message) {
        this.httpStatus = httpStatus;
        this.message = message;
    }

    public String getCode() {
        return this.name();
    }
}
