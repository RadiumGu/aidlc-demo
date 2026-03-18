package com.awsome.shop.product.controller;

import com.awsome.shop.product.common.PageResult;
import com.awsome.shop.product.common.Result;
import com.awsome.shop.product.dto.*;
import com.awsome.shop.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductService productService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Result<ProductResponse> create(@Valid @RequestBody CreateProductRequest request) {
        return Result.success(productService.createProduct(request));
    }

    @PutMapping("/{id}")
    public Result<ProductResponse> update(@PathVariable Long id,
                                          @Valid @RequestBody UpdateProductRequest request) {
        return Result.success(productService.updateProduct(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        productService.deleteProduct(id);
    }

    @GetMapping
    public Result<PageResult<ProductResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status) {
        return Result.success(productService.getAdminProductList(page, size, categoryId, keyword, status));
    }
}
