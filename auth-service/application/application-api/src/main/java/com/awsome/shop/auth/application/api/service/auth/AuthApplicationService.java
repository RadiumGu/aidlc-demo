package com.awsome.shop.auth.application.api.service.auth;

import com.awsome.shop.auth.application.api.dto.auth.AuthResponse;
import com.awsome.shop.auth.application.api.dto.auth.AuthValidateResponse;
import com.awsome.shop.auth.application.api.dto.auth.UserDTO;
import com.awsome.shop.auth.application.api.dto.auth.request.AuthValidateRequest;
import com.awsome.shop.auth.application.api.dto.auth.request.LoginRequest;
import com.awsome.shop.auth.application.api.dto.auth.request.RefreshTokenRequest;

/**
 * 认证应用服务接口
 */
public interface AuthApplicationService {

    AuthResponse login(LoginRequest request);

    void logout(String token);

    AuthValidateResponse validateToken(AuthValidateRequest request);

    AuthResponse refreshToken(RefreshTokenRequest request);

    UserDTO getCurrentUser(String token);
}
