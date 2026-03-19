package com.awsome.shop.auth.application.service.impl;

import com.awsome.shop.auth.application.client.PointsClient;
import com.awsome.shop.auth.application.dto.*;
import com.awsome.shop.auth.application.service.AuthAppService;
import com.awsome.shop.auth.common.dto.PageResult;
import com.awsome.shop.auth.domain.model.User;
import com.awsome.shop.auth.domain.model.enums.UserStatus;
import com.awsome.shop.auth.domain.security.JwtTokenProvider;
import com.awsome.shop.auth.domain.service.AuthService;
import com.awsome.shop.auth.domain.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

/**
 * 认证应用服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthAppServiceImpl implements AuthAppService {

    private final AuthService authService;
    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    private final PointsClient pointsClient;

    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @Override
    public UserResponse register(RegisterRequest request) {
        User user = User.builder()
                .username(request.getUsername())
                .password(request.getPassword())
                .name(request.getName())
                .employeeId(request.getEmployeeId())
                .build();

        User saved = authService.register(user);

        // 异步初始化积分（降级处理）
        try {
            pointsClient.initPoints(saved.getId());
        } catch (Exception e) {
            log.warn("积分初始化失败，用户ID: {}，将在首次查询时补偿", saved.getId(), e);
        }

        return toUserResponse(saved);
    }

    @Override
    public TokenResponse login(LoginRequest request) {
        User user = authService.login(request.getUsername(), request.getPassword());

        String token = jwtTokenProvider.generateToken(
                user.getId(), user.getUsername(), user.getRole().name());

        return TokenResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .role(user.getRole().name())
                .expiresIn(jwtTokenProvider.getExpiration())
                .build();
    }

    @Override
    public UserResponse getCurrentUser(Long userId) {
        User user = userService.getUserById(userId);
        return toUserResponse(user);
    }

    @Override
    public PageResult<UserResponse> getUserList(int page, int size, String keyword) {
        PageResult<User> pageResult = userService.getUserList(page, size, keyword);
        return pageResult.convert(this::toUserResponse);
    }

    @Override
    public UserResponse getUserById(Long id) {
        User user = userService.getUserById(id);
        return toUserResponse(user);
    }

    @Override
    public UserResponse updateUser(Long id, UpdateUserRequest request, Long operatorId) {
        UserStatus status = null;
        if (request.getStatus() != null) {
            status = UserStatus.valueOf(request.getStatus());
        }
        User user = userService.updateUser(id, request.getName(), status, operatorId);
        return toUserResponse(user);
    }

    @Override
    public StatsResponse getStats() {
        long total = userService.countAll();
        long monthNew = userService.countCreatedSince(
                java.time.LocalDateTime.now().withDayOfMonth(1).toLocalDate().atStartOfDay());
        return StatsResponse.builder().total(total).monthNew(monthNew).build();
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .name(user.getName())
                .employeeId(user.getEmployeeId())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().format(ISO_FORMATTER) : null)
                .build();
    }
}
