package com.awsome.shop.gateway.filter;

import com.awsome.shop.gateway.config.AccessRuleConfig.AccessLevel;
import com.awsome.shop.gateway.model.GatewayErrorCode;
import com.awsome.shop.gateway.model.UserInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

/**
 * 授权过滤器 — 角色校验 + 请求头处理
 * 执行顺序: @Order(2)，在认证过滤器之后
 */
@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
public class AuthorizationFilter implements Filter {

    private static final String HEADER_USER_ID = "X-User-Id";
    private static final String HEADER_USER_ROLE = "X-User-Role";

    private final ObjectMapper objectMapper;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        AccessLevel accessLevel = (AccessLevel) httpRequest.getAttribute(AuthenticationFilter.ATTR_ACCESS_LEVEL);
        UserInfo userInfo = (UserInfo) httpRequest.getAttribute(AuthenticationFilter.ATTR_USER_INFO);

        // ADMIN_ONLY 端点：校验管理员角色
        if (accessLevel == AccessLevel.ADMIN_ONLY) {
            if (userInfo == null || !"ADMIN".equals(userInfo.getRole())) {
                String path = httpRequest.getRequestURI();
                log.warn("权限不足: path={}, userId={}, userRole={}, requiredRole=ADMIN",
                        path,
                        userInfo != null ? userInfo.getUserId() : "null",
                        userInfo != null ? userInfo.getRole() : "null");
                writeError(httpResponse, GatewayErrorCode.GW_002);
                return;
            }
        }

        // 请求头处理由 GatewayController 在转发前执行
        // 此处将 userInfo 传递下去即可
        chain.doFilter(request, response);
    }

    private void writeError(HttpServletResponse response, GatewayErrorCode errorCode) throws IOException {
        response.setStatus(errorCode.getHttpStatus());
        response.setContentType("application/json;charset=UTF-8");
        Map<String, Object> body = Map.of(
                "code", errorCode.getCode(),
                "message", errorCode.getMessage(),
                "data", ""
        );
        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
