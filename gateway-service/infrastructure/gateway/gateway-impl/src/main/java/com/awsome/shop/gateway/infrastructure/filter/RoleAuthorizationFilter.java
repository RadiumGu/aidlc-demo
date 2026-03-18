package com.awsome.shop.gateway.infrastructure.filter;

import com.awsome.shop.gateway.common.constants.RouteConstants;
import com.awsome.shop.gateway.common.enums.GatewayErrorCode;
import com.awsome.shop.gateway.common.exception.AuthorizationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * Global filter for role-based authorization.
 *
 * <p>Order: +150 - executes after AuthenticationGatewayFilter (+100).</p>
 *
 * <p>Checks that requests to /api/v1/admin/** paths carry the ADMIN role
 * (set by AuthenticationGatewayFilter in the X-Role header).</p>
 */
@Slf4j
@Component
public class RoleAuthorizationFilter implements GlobalFilter, Ordered {

    private static final String ROLE_ADMIN = "ADMIN";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        // Only check admin paths
        if (!path.startsWith(RouteConstants.PATH_PREFIX_ADMIN)) {
            return chain.filter(exchange);
        }

        // Read role from request header (injected by AuthenticationGatewayFilter)
        ServerHttpRequest request = exchange.getRequest();
        String role = request.getHeaders().getFirst(RouteConstants.HEADER_ROLE);

        if (!ROLE_ADMIN.equalsIgnoreCase(role)) {
            String requestId = exchange.getAttribute(RouteConstants.ATTR_REQUEST_ID);
            log.warn("[{}] Access denied to admin path {}: role={}", requestId, path, role);
            return Mono.error(new AuthorizationException(GatewayErrorCode.AUTHZ_FORBIDDEN));
        }

        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return 150;
    }
}
