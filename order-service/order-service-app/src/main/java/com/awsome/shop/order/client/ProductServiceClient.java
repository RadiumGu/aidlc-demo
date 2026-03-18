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
 * product-service 远程调用客户端
 */
@Slf4j
@Component
public class ProductServiceClient {

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public ProductServiceClient(RestTemplate restTemplate,
                                @Value("${service.product-url}") String baseUrl) {
        this.restTemplate = restTemplate;
        this.baseUrl = baseUrl;
    }

    /**
     * 查询产品信息
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getProduct(Long productId) {
        String url = baseUrl + "/api/internal/products/" + productId;
        try {
            return executeWithRetry(() -> {
                ResponseEntity<Map<String, Object>> resp = restTemplate.exchange(
                        url, HttpMethod.GET, null,
                        new ParameterizedTypeReference<>() {});
                return extractData(resp);
            });
        } catch (HttpClientErrorException.NotFound e) {
            throw new BusinessException(OrderErrorCode.PRODUCT_NOT_FOUND);
        } catch (HttpClientErrorException e) {
            log.error("查询产品失败: productId={}, status={}", productId, e.getStatusCode());
            throw new BusinessException(OrderErrorCode.ORDER_PROCESS_FAILED);
        }
    }

    /**
     * 扣减库存
     */
    public void deductStock(Long productId, int quantity) {
        String url = baseUrl + "/api/internal/products/deduct-stock";
        Map<String, Object> body = new HashMap<>();
        body.put("productId", productId);
        body.put("quantity", quantity);
        try {
            executeWithRetry(() -> {
                restTemplate.postForEntity(url, body, Map.class);
                return null;
            });
        } catch (HttpClientErrorException e) {
            log.error("扣减库存失败: productId={}, status={}, body={}", productId, e.getStatusCode(), e.getResponseBodyAsString());
            throw new BusinessException(OrderErrorCode.STOCK_INSUFFICIENT);
        }
    }

    /**
     * 恢复库存
     */
    public void restoreStock(Long productId, int quantity) {
        String url = baseUrl + "/api/internal/products/restore-stock";
        Map<String, Object> body = new HashMap<>();
        body.put("productId", productId);
        body.put("quantity", quantity);
        try {
            executeWithRetry(() -> {
                restTemplate.postForEntity(url, body, Map.class);
                return null;
            });
        } catch (Exception e) {
            log.error("恢复库存失败: productId={}, error={}", productId, e.getMessage());
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
