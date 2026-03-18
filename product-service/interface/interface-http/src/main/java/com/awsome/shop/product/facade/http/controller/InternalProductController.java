package com.awsome.shop.product.facade.http.controller;

import com.awsome.shop.product.application.api.dto.product.request.DeductStockRequest;
import com.awsome.shop.product.application.api.dto.product.request.RestoreStockRequest;
import com.awsome.shop.product.application.api.service.product.ProductApplicationService;
import com.awsome.shop.product.common.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 内部商品接口（供其他微服务调用）
 */
@Tag(name = "Internal Product", description = "内部商品接口（供其他微服务调用）")
@RestController
@RequestMapping("/api/v1/internal/product")
@RequiredArgsConstructor
public class InternalProductController {

    private final ProductApplicationService productApplicationService;

    @Operation(summary = "库存扣减")
    @PostMapping("/deduct-stock")
    public Result<Void> deductStock(@RequestBody @Valid DeductStockRequest request) {
        productApplicationService.deductStock(request);
        return Result.success();
    }

    @Operation(summary = "库存恢复")
    @PostMapping("/restore-stock")
    public Result<Void> restoreStock(@RequestBody @Valid RestoreStockRequest request) {
        productApplicationService.restoreStock(request);
        return Result.success();
    }
}
