package com.awsome.shop.product.controller;

import com.awsome.shop.product.common.Result;
import com.awsome.shop.product.dto.ProductResponse;
import com.awsome.shop.product.dto.StockDeductRequest;
import com.awsome.shop.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/internal/products")
@RequiredArgsConstructor
public class InternalProductController {

    private final ProductService productService;

    @GetMapping("/{id}")
    public Result<ProductResponse> getProduct(@PathVariable Long id) {
        return Result.success(productService.getProductById(id));
    }

    @PostMapping("/deduct-stock")
    public Result<Void> deductStock(@Valid @RequestBody StockDeductRequest request) {
        productService.deductStock(request.getProductId(), request.getQuantity());
        return Result.success();
    }

    @PostMapping("/restore-stock")
    public Result<Void> restoreStock(@Valid @RequestBody StockDeductRequest request) {
        productService.restoreStock(request.getProductId(), request.getQuantity());
        return Result.success();
    }
}
