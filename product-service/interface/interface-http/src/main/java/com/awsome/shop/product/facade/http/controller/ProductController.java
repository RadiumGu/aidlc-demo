package com.awsome.shop.product.facade.http.controller;

import com.awsome.shop.product.application.api.dto.product.ProductDTO;
import com.awsome.shop.product.application.api.dto.product.request.*;
import com.awsome.shop.product.application.api.service.product.ProductApplicationService;
import com.awsome.shop.product.common.dto.PageResult;
import com.awsome.shop.product.common.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 商品管理 Controller
 */
@Tag(name = "Product", description = "商品管理")
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ProductController {

    private final ProductApplicationService productApplicationService;

    @Operation(summary = "创建商品")
    @PostMapping("/admin/product/create")
    public Result<ProductDTO> create(@RequestBody @Valid CreateProductRequest request) {
        return Result.success(productApplicationService.create(request));
    }

    @Operation(summary = "编辑商品")
    @PostMapping("/admin/product/update")
    public Result<ProductDTO> update(@RequestBody @Valid UpdateProductRequest request) {
        return Result.success(productApplicationService.update(request));
    }

    @Operation(summary = "更新商品状态（上下架）")
    @PostMapping("/admin/product/status")
    public Result<Void> updateStatus(@RequestBody @Valid UpdateStatusRequest request) {
        productApplicationService.updateStatus(request);
        return Result.success();
    }

    @Operation(summary = "商品列表查询")
    @PostMapping("/public/product/list")
    public Result<PageResult<ProductDTO>> list(@RequestBody @Valid ListProductRequest request) {
        return Result.success(productApplicationService.list(request));
    }

    @Operation(summary = "商品详情")
    @GetMapping("/public/product/{id}")
    public Result<ProductDTO> detail(@PathVariable Long id) {
        return Result.success(productApplicationService.detail(id));
    }
}
