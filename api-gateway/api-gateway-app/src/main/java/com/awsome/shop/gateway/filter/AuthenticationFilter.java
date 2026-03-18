package com.awsome.shop.gateway.filter;

import com.awsome.shop.gateway.config.AccessRuleConfig;
import com.awsome.shop.gateway.config.AccessRuleConfig.AccessLevel;
import com.awsome.shop.gateway.model.GatewayErrorCode;
import com.awsome.shop.gateway.model.UserInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Set;

/**
 * 认证过滤器 — JWT 校验、用户信息提取
 * 执行顺序: @Order(1)，在授权过滤器之前
 */
@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class AuthenticationFilter implements Filter {

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    private static final Set<String> VALID_ROLES = Set.of("EMPLOYEE", "ADMIN");

    public static final String ATTR_USER_INFO = "gateway.userInfo";
    public static final String ATTR_ACCESS_LEVEL = "gateway.accessLevel";

    private final AccessRuleConfig accessRuleConfig;
    private final ObjectMapper objectMapper;

    @Value("${JWT_SECRET}")
    private String jwtSecret;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String method = httpRequest.getMethod();
        String path = httpRequest.getRequestURI();

        // 判定权限级别
        AccessLevel accessLevel = accessRuleConfig.determineAccessLevel(method, path);
        httpRequest.setAttribute(ATTR_ACCESS_LEVEL, accessLevel);

        // PUBLIC 端点：跳过认证
        if (accessLevel == AccessLevel.PUBLIC) {
            chain.doFilter(request, response);
            return;
        }

        // 需要认证的端点：校验 JWT
        String authHeader = httpRequest.getHeader(AUTHORIZATION_HEADER);
        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            log.warn("认证失败: path={}, reason=Authorization头缺失或格式错误", path);
            writeError(httpResponse, GatewayErrorCode.GW_001);
            return;
        }

        String token = authHeader.substring(BEARER_PREFIX.length()).trim();
        if (token.isEmpty()) {
            log.warn("认证失败: path={}, reason=Bearer后无内容", path);
            writeError(httpResponse, GatewayErrorCode.GW_001);
            return;
        }

        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            // 提取并校验 payload 字段
            Long userId = claims.get("userId", Long.class);
            String username = claims.get("username", String.class);
            String role = claims.get("role", String.class);

            if (userId == null || username == null || role == null) {
                log.warn("认证失败: path={}, reason=JWT payload字段缺失", path);
                writeError(httpResponse, GatewayErrorCode.GW_001);
                return;
            }

            if (!VALID_ROLES.contains(role)) {
                log.warn("认证失败: path={}, reason=role值非法: {}", path, role);
                writeError(httpResponse, GatewayErrorCode.GW_001);
                return;
            }

            // 校验通过，存入请求上下文
            UserInfo userInfo = new UserInfo(userId, username, role);
            httpRequest.setAttribute(ATTR_USER_INFO, userInfo);

            chain.doFilter(request, response);

        } catch (Exception e) {
            log.warn("认证失败: path={}, reason={}", path, e.getMessage());
            writeError(httpResponse, GatewayErrorCode.GW_001);
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
