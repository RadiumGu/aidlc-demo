package com.awsome.shop.gateway.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * 路由配置 — 精确前缀匹配，按优先级排序
 */
@Slf4j
@Configuration
public class RouteConfig {

    @Value("${AUTH_SERVICE_URL:http://auth-service:8001}")
    private String authServiceUrl;

    @Value("${PRODUCT_SERVICE_URL:http://product-service:8002}")
    private String productServiceUrl;

    @Value("${POINTS_SERVICE_URL:http://points-service:8003}")
    private String pointsServiceUrl;

    @Value("${ORDER_SERVICE_URL:http://order-service:8004}")
    private String orderServiceUrl;

    private List<RouteRule> routes;

    @PostConstruct
    public void init() {
        routes = new ArrayList<>();
        // 优先级 100: 认证相关
        routes.add(new RouteRule("/api/auth", authServiceUrl, 100));
        // 优先级 90: 管理员端点（更具体的前缀优先）
        routes.add(new RouteRule("/api/admin/users", authServiceUrl, 90));
        routes.add(new RouteRule("/api/admin/products", productServiceUrl, 90));
        routes.add(new RouteRule("/api/admin/categories", productServiceUrl, 90));
        routes.add(new RouteRule("/api/admin/points", pointsServiceUrl, 90));
        routes.add(new RouteRule("/api/admin/orders", orderServiceUrl, 90));
        // 优先级 80: 通用端点
        routes.add(new RouteRule("/api/users", authServiceUrl, 80));
        routes.add(new RouteRule("/api/products", productServiceUrl, 80));
        routes.add(new RouteRule("/api/categories", productServiceUrl, 80));
        routes.add(new RouteRule("/api/files", productServiceUrl, 80));
        routes.add(new RouteRule("/api/points", pointsServiceUrl, 80));
        routes.add(new RouteRule("/api/orders", orderServiceUrl, 80));

        // 按优先级降序 + 前缀长度降序排序（确保更具体的前缀优先匹配）
        routes.sort(Comparator.comparingInt(RouteRule::priority).reversed()
                .thenComparing(Comparator.comparingInt((RouteRule r) -> r.prefix().length()).reversed()));

        log.info("路由配置加载完成，共 {} 条规则", routes.size());
    }

    /**
     * 根据请求路径匹配目标服务 URL
     * @return 目标服务 URL，无匹配返回 null
     */
    public String resolveTarget(String path) {
        for (RouteRule route : routes) {
            if (path.startsWith(route.prefix())) {
                return route.targetUrl();
            }
        }
        return null;
    }

    public record RouteRule(String prefix, String targetUrl, int priority) {}
}
