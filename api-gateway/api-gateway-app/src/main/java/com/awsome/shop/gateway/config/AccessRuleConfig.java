package com.awsome.shop.gateway.config;

import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * 权限规则配置 — 三级权限控制
 * 匹配优先级: PUBLIC > ADMIN_ONLY > AUTHENTICATED
 */
@Configuration
public class AccessRuleConfig {

    public enum AccessLevel {
        PUBLIC,
        AUTHENTICATED,
        ADMIN_ONLY
    }

    private record AccessRule(String method, String pathPattern) {
        boolean matches(String reqMethod, String reqPath) {
            // 方法匹配: "*" 表示所有方法
            if (!"*".equals(method) && !method.equalsIgnoreCase(reqMethod)) {
                return false;
            }
            // 路径匹配: 支持通配符 *
            if (pathPattern.endsWith("/*")) {
                String prefix = pathPattern.substring(0, pathPattern.length() - 2);
                return reqPath.startsWith(prefix);
            }
            return reqPath.equals(pathPattern);
        }
    }

    private static final List<AccessRule> PUBLIC_RULES = List.of(
            new AccessRule("POST", "/api/auth/register"),
            new AccessRule("POST", "/api/auth/login")
    );

    private static final List<AccessRule> ADMIN_ONLY_RULES = List.of(
            new AccessRule("*", "/api/admin/*"),
            new AccessRule("POST", "/api/files/upload"),
            new AccessRule("DELETE", "/api/files/*")
    );

    private static final List<AccessRule> AUTHENTICATED_RULES = List.of(
            new AccessRule("*", "/api/*")
    );

    /**
     * 判定请求的访问级别
     */
    public AccessLevel determineAccessLevel(String method, String path) {
        for (AccessRule rule : PUBLIC_RULES) {
            if (rule.matches(method, path)) {
                return AccessLevel.PUBLIC;
            }
        }
        for (AccessRule rule : ADMIN_ONLY_RULES) {
            if (rule.matches(method, path)) {
                return AccessLevel.ADMIN_ONLY;
            }
        }
        for (AccessRule rule : AUTHENTICATED_RULES) {
            if (rule.matches(method, path)) {
                return AccessLevel.AUTHENTICATED;
            }
        }
        return null; // 无匹配规则
    }
}
