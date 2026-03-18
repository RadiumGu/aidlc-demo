package com.awsome.shop.gateway;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@Slf4j
@SpringBootApplication
public class GatewayApplication {

    @Value("${JWT_SECRET:}")
    private String jwtSecret;

    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }

    @PostConstruct
    public void validateConfig() {
        if (jwtSecret == null || jwtSecret.isBlank()) {
            log.error("JWT_SECRET 环境变量未配置，网关启动失败");
            throw new IllegalStateException("JWT_SECRET 环境变量未配置");
        }
        log.info("API Gateway 配置校验通过");
    }
}
