package com.awsome.shop.auth.facade.http.controller;

import com.awsome.shop.auth.application.api.dto.auth.AuthValidateResponse;
import com.awsome.shop.auth.application.api.dto.auth.request.AuthValidateRequest;
import com.awsome.shop.auth.application.api.service.auth.AuthApplicationService;
import com.awsome.shop.auth.common.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 内部 Token 验证 Controller（微服务间调用）
 */
@Tag(name = "Internal Auth", description = "内部Token验证")
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class InternalAuthController {

    private final AuthApplicationService authApplicationService;

    @Operation(summary = "验证Token")
    @PostMapping("/internal/auth/validate")
    public Result<AuthValidateResponse> validate(@RequestBody @Valid AuthValidateRequest request) {
        return Result.success(authApplicationService.validateToken(request));
    }
}
