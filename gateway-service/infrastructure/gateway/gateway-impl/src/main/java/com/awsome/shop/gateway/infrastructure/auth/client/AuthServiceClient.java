package com.awsome.shop.gateway.infrastructure.auth.client;

import com.awsome.shop.gateway.application.auth.dto.AuthValidateRequest;
import com.awsome.shop.gateway.application.auth.dto.AuthValidateResponse;
import com.awsome.shop.gateway.common.enums.GatewayErrorCode;
import com.awsome.shop.gateway.common.exception.AuthenticationException;
import com.awsome.shop.gateway.domain.auth.model.AuthenticationResult;
import com.awsome.shop.gateway.domain.auth.service.AuthenticationService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;

/**
 * Auth service client that validates tokens via external auth service using WebClient.
 * Auth Service 返回 Result<AuthValidateResponse> 格式: { code, message, data: { valid, userId, username, role } }
 */
@Slf4j
@Component
public class AuthServiceClient implements AuthenticationService {

    private final WebClient webClient;
    private final String authValidateUrl;
    private final Duration timeout;
    private final ObjectMapper objectMapper;

    public AuthServiceClient(
            WebClient.Builder webClientBuilder,
            @Value("${gateway.auth.validate-url}") String authValidateUrl,
            @Value("${gateway.auth.timeout:5s}") Duration timeout,
            ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.authValidateUrl = authValidateUrl;
        this.timeout = timeout;
        this.objectMapper = objectMapper;
    }

    @Override
    public Mono<AuthenticationResult> validate(String token) {
        AuthValidateRequest request = AuthValidateRequest.builder()
                .token(token)
                .build();

        return webClient.post()
                .uri(authValidateUrl)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(String.class)
                .timeout(timeout)
                .map(body -> {
                    try {
                        JsonNode root = objectMapper.readTree(body);
                        // Auth Service 返回 Result 包装: { code: "0", message: "success", data: {...} }
                        JsonNode dataNode = root.has("data") ? root.get("data") : root;
                        AuthValidateResponse response = objectMapper.treeToValue(dataNode, AuthValidateResponse.class);

                        if (response.isValid()) {
                            String operatorId = response.getUserId() != null
                                    ? String.valueOf(response.getUserId())
                                    : null;
                            return AuthenticationResult.success(
                                    operatorId,
                                    response.getUsername(),
                                    response.getRole());
                        }
                        String msg = response.getMessage() != null
                                ? response.getMessage()
                                : "Token validation failed";
                        return AuthenticationResult.failure(msg);
                    } catch (Exception e) {
                        log.error("Failed to parse auth response: {}", body, e);
                        return AuthenticationResult.failure("Auth response parse error");
                    }
                })
                .onErrorResume(ex -> {
                    if (ex instanceof AuthenticationException) {
                        return Mono.error(ex);
                    }
                    log.error("Auth service call failed: {}", ex.getMessage(), ex);
                    return Mono.error(new AuthenticationException(
                            GatewayErrorCode.AUTH_SERVICE_UNAVAILABLE,
                            "Authentication service unavailable: " + ex.getMessage()));
                });
    }
}
