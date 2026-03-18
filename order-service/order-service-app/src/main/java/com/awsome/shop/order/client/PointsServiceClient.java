package com.awsome.shop.order.client;

import com.awsome.shop.order.common.BusinessException;
import com.awsome.shop.order.enums.OrderErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * points-service 远程调用客户端
 */
@Slf4j
@Component
public class PointsServiceClient {

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public PointsServiceClient(RestTemplate restTemplate,
                               @Value("${service.points-url}") String baseUrl) {
        this.restTemplate = restTemplate;
        this.baseUrl = baseUrl;
    }

    /**
     * 查询用户积分余额
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getBalance(Long userId) {
        String url = baseUrl + "/api/internal/points/balance/" + userId;
        try {
            return executeWithRetry(() -> {
                ResponseEntity<Map<String, Object>> resp = restTemplate.exchange(
                        url, HttpMethod.GET, null,
                        new ParameterizedTypeReference<>() {});
                return extractData(resp);
            });
        } catch (HttpClientErrorException.NotFound e) {
            throw new BusinessException(OrderErrorCode.POINTS_ACCOUNT_NOT_FOUND);
        } catch (HttpClientErrorException e) {
            log.error("查询积分余额失败: userId={}, status={}", userId, e.getStatusCode());
            throw new BusinessException(OrderErrorCode.ORDER_PROCESS_FAILED);
        }
    }

    /**
     * 扣除积分
     * @return 积分流水ID (transactionId)
     */
    @SuppressWarnings("unchecked")
    public Long deductPoints(Long userId, int amount, Long orderId) {
        String url = baseUrl + "/api/internal/points/deduct";
        Map<String, Object> body = new HashMap<>();
        body.put("userId", userId);
        body.put("amount", amount);
        body.put("referenceId", orderId);
        try {
            return executeWithRetry(() -> {
                ResponseEntity<Map<String, Object>> resp = restTemplate.exchange(
                        url, HttpMethod.POST, new org.springframework.http.HttpEntity<>(body),
                        new ParameterizedTypeReference<>() {});
                Map<String, Object> data = extractData(resp);
                Object id = data.get("id");
                return id instanceof Number ? ((Number) id).longValue() : null;
            });
        } catch (HttpClientErrorException e) {
            log.error("扣除积分失败: userId={}, amount={}, orderId={}, status={}", userId, amount, orderId, e.getStatusCode());
            String responseBody = e.getResponseBodyAsString();
            if (responseBody.contains("POINTS_003")) {
                throw new BusinessException(OrderErrorCode.POINTS_INSUFFICIENT);
            }
            throw new BusinessException(OrderErrorCode.ORDER_PROCESS_FAILED);
        }
    }

    /**
     * 回滚积分扣除
     */
    public void rollbackDeduction(Long transactionId) {
        String url = baseUrl + "/api/internal/points/rollback";
        Map<String, Object> body = new HashMap<>();
        body.put("transactionId", transactionId);
        try {
            executeWithRetry(() -> {
                restTemplate.postForEntity(url, body, Map.class);
                return null;
            });
        } catch (Exception e) {
            log.error("回滚积分失败: transactionId={}, error={}", transactionId, e.getMessage());
            throw new BusinessException(OrderErrorCode.CANCEL_REFUND_FAILED);
        }
    }

    /**
     * 带重试的执行（仅对超时和网络异常重试1次，4xx不重试）
     */
    private <T> T executeWithRetry(RetryableAction<T> action) {
        try {
            return action.execute();
        } catch (ResourceAccessException e) {
            log.warn("跨服务调用超时，重试1次: {}", e.getMessage());
            return action.execute();
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> extractData(ResponseEntity<Map<String, Object>> resp) {
        Map<String, Object> body = resp.getBody();
        if (body != null && "SUCCESS".equals(body.get("code"))) {
            Object data = body.get("data");
            return data instanceof Map ? (Map<String, Object>) data : new HashMap<>();
        }
        return new HashMap<>();
    }

    @FunctionalInterface
    private interface RetryableAction<T> {
        T execute();
    }
}
