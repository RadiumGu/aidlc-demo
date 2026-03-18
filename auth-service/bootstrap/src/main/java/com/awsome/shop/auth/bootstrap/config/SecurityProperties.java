package com.awsome.shop.auth.bootstrap.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * 安全配置属性
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "security")
public class SecurityProperties {

    private Jwt jwt = new Jwt();
    private Login login = new Login();

    @Data
    public static class Jwt {
        private String secret;
        private long expiration = 7200;
        private long refreshExpiration = 604800;
        private String issuer = "awsome-shop-auth-service";
    }

    @Data
    public static class Login {
        private int maxFailedAttempts = 5;
        private long lockDuration = 1800;
    }
}
