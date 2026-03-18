package com.awsome.shop.auth.application.impl.service.auth;

import com.awsome.shop.auth.application.api.dto.auth.AuthResponse;
import com.awsome.shop.auth.application.api.dto.auth.AuthValidateResponse;
import com.awsome.shop.auth.application.api.dto.auth.UserDTO;
import com.awsome.shop.auth.application.api.dto.auth.request.AuthValidateRequest;
import com.awsome.shop.auth.application.api.dto.auth.request.LoginRequest;
import com.awsome.shop.auth.application.api.dto.auth.request.RefreshTokenRequest;
import com.awsome.shop.auth.application.api.service.auth.AuthApplicationService;
import com.awsome.shop.auth.common.enums.AuthErrorCode;
import com.awsome.shop.auth.common.exception.BusinessException;
import com.awsome.shop.auth.domain.model.user.UserEntity;
import com.awsome.shop.auth.domain.service.auth.AuthDomainService;
import com.awsome.shop.auth.domain.service.auth.JwtTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * 认证应用服务实现
 */
@Service
@RequiredArgsConstructor
public class AuthApplicationServiceImpl implements AuthApplicationService {

    private final AuthDomainService authDomainService;
    private final JwtTokenService jwtTokenService;

    @Value("${security.jwt.expiration:7200}")
    private long accessTokenExpiration;

    @Override
    public AuthResponse login(LoginRequest request) {
        UserEntity user = authDomainService.authenticate(request.getUsername(), request.getPassword());

        String accessToken = jwtTokenService.generateAccessToken(user.getId(), user.getUsername(), user.getRole().name());
        String refreshToken = jwtTokenService.generateRefreshToken(user.getId(), user.getUsername());

        AuthResponse response = new AuthResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setExpiresIn(accessTokenExpiration);
        response.setUser(toUserDTO(user));
        return response;
    }

    @Override
    public void logout(String token) {
        jwtTokenService.invalidate(token);
    }

    @Override
    public AuthValidateResponse validateToken(AuthValidateRequest request) {
        AuthValidateResponse response = new AuthValidateResponse();
        try {
            if (jwtTokenService.isBlacklisted(request.getToken())) {
                response.setValid(false);
                return response;
            }
            Map<String, Object> claims = jwtTokenService.validate(request.getToken());
            response.setValid(true);
            response.setUserId(((Number) claims.get("userId")).longValue());
            response.setUsername((String) claims.get("username"));
            response.setRole((String) claims.get("role"));
        } catch (Exception e) {
            response.setValid(false);
        }
        return response;
    }

    @Override
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        if (jwtTokenService.isBlacklisted(request.getRefreshToken())) {
            throw new BusinessException(AuthErrorCode.INVALID_TOKEN);
        }

        Map<String, Object> claims;
        try {
            claims = jwtTokenService.validate(request.getRefreshToken());
        } catch (Exception e) {
            throw new BusinessException(AuthErrorCode.INVALID_TOKEN);
        }

        Long userId = ((Number) claims.get("userId")).longValue();
        String username = (String) claims.get("username");

        // 查询最新用户信息
        UserEntity user = authDomainService.getUserById(userId);

        // 使旧 refresh token 失效
        jwtTokenService.invalidate(request.getRefreshToken());

        String accessToken = jwtTokenService.generateAccessToken(user.getId(), user.getUsername(), user.getRole().name());
        String refreshToken = jwtTokenService.generateRefreshToken(user.getId(), user.getUsername());

        AuthResponse response = new AuthResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setExpiresIn(accessTokenExpiration);
        response.setUser(toUserDTO(user));
        return response;
    }

    @Override
    public UserDTO getCurrentUser(String token) {
        if (jwtTokenService.isBlacklisted(token)) {
            throw new BusinessException(AuthErrorCode.INVALID_TOKEN);
        }

        Map<String, Object> claims;
        try {
            claims = jwtTokenService.validate(token);
        } catch (Exception e) {
            throw new BusinessException(AuthErrorCode.INVALID_TOKEN);
        }

        Long userId = ((Number) claims.get("userId")).longValue();
        UserEntity user = authDomainService.getUserById(userId);
        return toUserDTO(user);
    }

    private UserDTO toUserDTO(UserEntity entity) {
        UserDTO dto = new UserDTO();
        dto.setId(entity.getId());
        dto.setUsername(entity.getUsername());
        dto.setDisplayName(entity.getDisplayName());
        dto.setRole(entity.getRole().name());
        dto.setAvatar(entity.getAvatar());
        dto.setStatus(entity.getStatus().name());
        return dto;
    }
}
