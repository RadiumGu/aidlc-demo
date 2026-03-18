package com.awsome.shop.gateway.controller;

import com.awsome.shop.gateway.config.RouteConfig;
import com.awsome.shop.gateway.filter.AuthenticationFilter;
import com.awsome.shop.gateway.model.GatewayErrorCode;
import com.awsome.shop.gateway.model.UserInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.*;

import java.io.IOException;
import java.net.URI;
import java.util.Enumeration;
import java.util.Map;
import java.util.Set;

/**
 * 网关控制器 — 路由匹配 + 请求头处理 + 请求转发
 */
@Slf4j
@RestController
@RequiredArgsConstructor
public class GatewayController {

    private static final String HEADER_USER_ID = "X-User-Id";
    private static final String HEADER_USER_ROLE = "X-User-Role";
    private static final Set<String> HOP_BY_HOP_HEADERS = Set.of(
            "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
            "te", "trailers", "transfer-encoding", "upgrade", "host"
    );

    private final RouteConfig routeConfig;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @RequestMapping("/api/**")
    public void proxy(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String path = request.getRequestURI();
        String method = request.getMethod();
        String queryString = request.getQueryString();

        // 内部接口隔离
        if (path.startsWith("/api/internal/")) {
            writeError(response, GatewayErrorCode.GW_005);
            return;
        }

        // 路由匹配
        String targetUrl = routeConfig.resolveTarget(path);
        if (targetUrl == null) {
            writeError(response, GatewayErrorCode.GW_005);
            return;
        }

        // 构建转发 URL
        String forwardUrl = targetUrl + path;
        if (queryString != null && !queryString.isEmpty()) {
            forwardUrl += "?" + queryString;
        }

        // 构建请求头
        HttpHeaders headers = new HttpHeaders();
        Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            if (HOP_BY_HOP_HEADERS.contains(headerName.toLowerCase())) {
                continue;
            }
            // 跳过伪造头（防伪造）
            if (HEADER_USER_ID.equalsIgnoreCase(headerName) || HEADER_USER_ROLE.equalsIgnoreCase(headerName)) {
                continue;
            }
            Enumeration<String> values = request.getHeaders(headerName);
            while (values.hasMoreElements()) {
                headers.add(headerName, values.nextElement());
            }
        }

        // 注入用户信息（仅已认证请求）
        UserInfo userInfo = (UserInfo) request.getAttribute(AuthenticationFilter.ATTR_USER_INFO);
        if (userInfo != null) {
            headers.set(HEADER_USER_ID, String.valueOf(userInfo.getUserId()));
            headers.set(HEADER_USER_ROLE, userInfo.getRole());
        }

        // 读取请求体
        byte[] body = StreamUtils.copyToByteArray(request.getInputStream());

        try {
            // 转发请求
            HttpEntity<byte[]> httpEntity = new HttpEntity<>(body, headers);
            ResponseEntity<byte[]> downstream = restTemplate.exchange(
                    URI.create(forwardUrl),
                    HttpMethod.valueOf(method),
                    httpEntity,
                    byte[].class
            );

            // 透传下游响应
            response.setStatus(downstream.getStatusCode().value());
            HttpHeaders downstreamHeaders = downstream.getHeaders();
            downstreamHeaders.forEach((name, values) -> {
                if (!HOP_BY_HOP_HEADERS.contains(name.toLowerCase())
                        && !"transfer-encoding".equalsIgnoreCase(name)) {
                    for (String value : values) {
                        response.addHeader(name, value);
                    }
                }
            });
            byte[] responseBody = downstream.getBody();
            if (responseBody != null) {
                response.getOutputStream().write(responseBody);
            }

            log.debug("请求转发成功: {} {} → {}, status={}", method, path, targetUrl,
                    downstream.getStatusCode().value());

        } catch (HttpStatusCodeException e) {
            // 下游返回 4xx/5xx — 透传
            response.setStatus(e.getStatusCode().value());
            HttpHeaders errHeaders = e.getResponseHeaders();
            if (errHeaders != null) {
                errHeaders.forEach((name, values) -> {
                    if (!HOP_BY_HOP_HEADERS.contains(name.toLowerCase())
                            && !"transfer-encoding".equalsIgnoreCase(name)) {
                        for (String value : values) {
                            response.addHeader(name, value);
                        }
                    }
                });
            }
            byte[] errBody = e.getResponseBodyAsByteArray();
            if (errBody.length > 0) {
                response.getOutputStream().write(errBody);
            }
        } catch (ResourceAccessException e) {
            // 连接失败或超时
            Throwable cause = e.getCause();
            if (cause instanceof java.net.SocketTimeoutException) {
                log.warn("下游响应超时: target={}, timeout", targetUrl);
                writeError(response, GatewayErrorCode.GW_004);
            } else {
                log.warn("下游服务不可达: target={}, error={}", targetUrl, e.getMessage());
                writeError(response, GatewayErrorCode.GW_003);
            }
        } catch (Exception e) {
            log.warn("下游服务不可达: target={}, error={}", targetUrl, e.getMessage());
            writeError(response, GatewayErrorCode.GW_003);
        }
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
