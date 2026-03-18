package com.awsome.shop.product.common;

/**
 * 错误码接口
 *
 * <p>类别前缀决定 HTTP 状态码：</p>
 * <ul>
 *   <li>AUTH_ → 401</li>
 *   <li>AUTHZ_ → 403</li>
 *   <li>PARAM_ → 400</li>
 *   <li>NOT_FOUND_ → 404</li>
 *   <li>CONFLICT_ → 409</li>
 *   <li>SYS_ → 500</li>
 * </ul>
 */
public interface ErrorCode {
    String getCode();
    String getMessage();
}
