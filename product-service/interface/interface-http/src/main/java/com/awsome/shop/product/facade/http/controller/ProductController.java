package com.awsome.shop.product.facade.http.controller;

import com.awsome.shop.product.application.api.dto.product.ProductDTO;
import com.awsome.shop.product.application.api.dto.product.request.CreateProductRequest;
import com.awsome.shop.product.application.api.dto.product.request.ListProductRequest;
import com.awsome.shop.product.application.api.service.product.ProductApplicationService;
import com.awsome.shop.product.common.dto.PageResult;
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
 * 商品管理 Controller
 */
@Tag(name = "Product", description = "商品管理")
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ProductController {

    private final ProductApplicationService productApplicationService;

    @Operation(summary = "创建商品")
    @PostMapping("/public/product/create")
    public Result<ProductDTO> create(@RequestBody @Valid CreateProductRequest request) {
        return Result.success(productApplicationService.create(request));
    }

    @Operation(summary = "商品列表查询")
    @PostMapping("/public/product/list")
    public Result<PageResult<ProductDTO>> list(@RequestBody @Valid ListProductRequest request) {
        return Result.success(productApplicationService.list(request));
    }
}
