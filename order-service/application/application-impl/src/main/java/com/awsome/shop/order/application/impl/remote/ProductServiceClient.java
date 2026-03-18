package com.awsome.shop.order.application.impl.remote;

import com.awsome.shop.order.common.enums.OrderErrorCode;
import com.awsome.shop.order.common.exception.BusinessException;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Map;

/**
 * 商品服务远程调用客户端
 */
@Slf4j
@Component
public class ProductServiceClient {

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public ProductServiceClient(RestTemplate restTemplate,
                                @Value("${product-service.url}") String baseUrl) {
        this.restTemplate = restTemplate;
        this.baseUrl = baseUrl;
    }

    /**
     * 查询商品详情
     */
    public ProductInfo getProduct(Long productId) {
        try {
            String url = baseUrl + "/api/v1/public/product/" + productId;
            ResponseEntity<RemoteResult<ProductInfo>> response = restTemplate.exchange(
                    url, HttpMethod.GET, null,
                    new ParameterizedTypeReference<RemoteResult<ProductInfo>>() {});
            RemoteResult<ProductInfo> body = response.getBody();
            if (body == null || !isSuccess(body) || body.getData() == null) {
                throw new BusinessException(OrderErrorCode.PRODUCT_NOT_FOUND);
            }
            return body.getData();
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("调用商品服务失败: productId={}", productId, e);
            throw new BusinessException(OrderErrorCode.PRODUCT_SERVICE_ERROR, "查询商品信息失败: " + e.getMessage());
        }
    }

    /**
     * 扣减库存
     */
    public void deductStock(Long productId, Integer quantity) {
        try {
            String url = baseUrl + "/api/v1/internal/product/deduct-stock";
            Map<String, Object> request = Map.of("productId", productId, "quantity", quantity);
            ResponseEntity<RemoteResult<Void>> response = restTemplate.exchange(
                    url, HttpMethod.POST, new HttpEntity<>(request),
                    new ParameterizedTypeReference<RemoteResult<Void>>() {});
            RemoteResult<Void> body = response.getBody();
            if (body == null || !isSuccess(body)) {
                String msg = body != null ? body.getMessage() : "未知错误";
                throw new BusinessException(OrderErrorCode.INSUFFICIENT_STOCK, msg);
            }
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("调用商品服务扣减库存失败: productId={}, quantity={}", productId, quantity, e);
            throw new BusinessException(OrderErrorCode.PRODUCT_SERVICE_ERROR, "扣减库存失败: " + e.getMessage());
        }
    }

    /**
     * 恢复库存（补偿）
     */
    public void restoreStock(Long productId, Integer quantity) {
        try {
            String url = baseUrl + "/api/v1/internal/product/restore-stock";
            Map<String, Object> request = Map.of("productId", productId, "quantity", quantity);
            restTemplate.postForEntity(url, request, String.class);
            log.info("恢复库存成功: productId={}, quantity={}", productId, quantity);
        } catch (Exception e) {
            log.error("恢复库存失败（补偿操作）: productId={}, quantity={}", productId, quantity, e);
            // 补偿操作失败只记录日志，不抛异常
        }
    }

    @Data
    public static class ProductInfo {
        private Long id;
        private String name;
        private String imageUrl;
        private Integer pointsPrice;
        private Integer stock;
    }

    @Data
    public static class RemoteResult<T> {
        private String code;
        private String message;
        private T data;
        private Boolean success;
    }

    private static boolean isSuccess(RemoteResult<?> result) {
        if ("SUCCESS".equals(result.getCode()) || "0".equals(result.getCode())) {
            return true;
        }
        return Boolean.TRUE.equals(result.getSuccess());
    }
}
