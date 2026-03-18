package com.awsome.shop.product.controller;

import com.awsome.shop.product.common.PageResult;
import com.awsome.shop.product.common.Result;
import com.awsome.shop.product.dto.ProductResponse;
import com.awsome.shop.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public Result<PageResult<ProductResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword) {
        return Result.success(productService.getProductList(page, size, categoryId, keyword));
    }

    @GetMapping("/{id}")
    public Result<ProductResponse> detail(@PathVariable Long id) {
        return Result.success(productService.getProductDetail(id));
    }
}
