package com.awsome.shop.auth.application.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.Map;

/**
 * 积分服务 HTTP 客户端
 *
 * <p>注册时调用 points-service 初始化积分余额。
 * 调用失败时降级处理，不影响注册流程。</p>
 */
@Slf4j
@Component
public class PointsClient {

    private final RestTemplate restTemplate;
    private final String pointsServiceUrl;

    public PointsClient(
            RestTemplateBuilder restTemplateBuilder,
            @Value("${points.service.url:http://points-service:8003}") String pointsServiceUrl) {
        this.restTemplate = restTemplateBuilder
                .connectTimeout(Duration.ofSeconds(1))
                .readTimeout(Duration.ofSeconds(2))
                .build();
        this.pointsServiceUrl = pointsServiceUrl;
    }

    /**
     * 初始化用户积分余额
     *
     * @param userId 用户ID
     */
    public void initPoints(Long userId) {
        String url = pointsServiceUrl + "/api/internal/points/init";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Long>> request = new HttpEntity<>(
                Map.of("userId", userId), headers);

        try {
            restTemplate.postForEntity(url, request, Void.class);
            log.info("积分初始化成功，用户ID: {}", userId);
        } catch (Exception e) {
            log.warn("积分初始化调用失败，用户ID: {}，原因: {}", userId, e.getMessage());
            throw e;
        }
    }
}
