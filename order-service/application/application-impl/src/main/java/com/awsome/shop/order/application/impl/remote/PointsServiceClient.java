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
 * 积分服务远程调用客户端
 */
@Slf4j
@Component
public class PointsServiceClient {

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public PointsServiceClient(RestTemplate restTemplate,
                               @Value("${points-service.url}") String baseUrl) {
        this.restTemplate = restTemplate;
        this.baseUrl = baseUrl;
    }

    /**
     * 扣减积分
     */
    public void deductPoints(Long employeeId, BigDecimal points, String orderNo) {
        try {
            String url = baseUrl + "/api/v1/internal/points/deduct";
            Map<String, Object> request = Map.of(
                    "employeeId", employeeId,
                    "amount", points.longValue(),
                    "orderId", orderNo
            );
            ResponseEntity<RemoteResult<Void>> response = restTemplate.exchange(
                    url, HttpMethod.POST, new HttpEntity<>(request),
                    new ParameterizedTypeReference<RemoteResult<Void>>() {});
            RemoteResult<Void> body = response.getBody();
            if (body == null || !isSuccess(body)) {
                String msg = body != null ? body.getMessage() : "未知错误";
                throw new BusinessException(OrderErrorCode.INSUFFICIENT_POINTS, msg);
            }
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("调用积分服务扣减积分失败: employeeId={}, points={}", employeeId, points, e);
            throw new BusinessException(OrderErrorCode.POINTS_SERVICE_ERROR, "扣减积分失败: " + e.getMessage());
        }
    }

    /**
     * 退还积分（补偿）
     */
    public void refundPoints(Long employeeId, BigDecimal points, String orderNo) {
        try {
            String url = baseUrl + "/api/v1/internal/points/refund";
            Map<String, Object> request = Map.of(
                    "employeeId", employeeId,
                    "amount", points.longValue(),
                    "orderId", orderNo
            );
            restTemplate.postForEntity(url, request, String.class);
            log.info("退还积分成功: employeeId={}, points={}, orderNo={}", employeeId, points, orderNo);
        } catch (Exception e) {
            log.error("退还积分失败（补偿操作）: employeeId={}, points={}, orderNo={}", employeeId, points, orderNo, e);
            // 补偿操作失败只记录日志，不抛异常
        }
    }

    @Data
    public static class RemoteResult<T> {
        private String code;
        private String message;
        private T data;
        private Boolean success;
    }

    /**
     * 兼容两种响应格式：
     * - Product Service: code="SUCCESS"
     * - Points Service: code="0", success=true
     */
    private static boolean isSuccess(RemoteResult<?> result) {
        if ("SUCCESS".equals(result.getCode()) || "0".equals(result.getCode())) {
            return true;
        }
        return Boolean.TRUE.equals(result.getSuccess());
    }
}
