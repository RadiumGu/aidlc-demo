package com.awsome.shop.gateway.application.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Auth validation response DTO from external auth service.
 *
 * <p>Expected response format:
 * { "valid": true, "userId": 1, "username": "admin", "role": "ADMIN" }
 * </p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthValidateResponse {

    private boolean valid;

    private Long userId;

    private String username;

    private String role;

    private String message;

    /**
     * Alias for backward compatibility — maps "success" JSON field to valid.
     */
    @JsonProperty("success")
    public void setSuccess(boolean success) {
        if (!this.valid) {
            this.valid = success;
        }
    }

    /**
     * Alias — maps "operatorId" JSON field to userId (string to Long).
     */
    @JsonProperty("operatorId")
    public void setOperatorId(String operatorId) {
        if (this.userId == null && operatorId != null) {
            try {
                this.userId = Long.parseLong(operatorId);
            } catch (NumberFormatException ignored) {
                // keep userId as null
            }
        }
    }
}
