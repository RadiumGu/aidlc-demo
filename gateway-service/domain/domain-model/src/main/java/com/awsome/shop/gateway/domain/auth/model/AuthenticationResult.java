package com.awsome.shop.gateway.domain.auth.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Authentication result value object
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthenticationResult {

    private boolean authenticated;

    private String operatorId;

    private String username;

    private String role;

    private String message;

    public static AuthenticationResult success(String operatorId, String username, String role) {
        return AuthenticationResult.builder()
                .authenticated(true)
                .operatorId(operatorId)
                .username(username)
                .role(role)
                .build();
    }

    public static AuthenticationResult failure(String message) {
        return AuthenticationResult.builder()
                .authenticated(false)
                .message(message)
                .build();
    }
}
