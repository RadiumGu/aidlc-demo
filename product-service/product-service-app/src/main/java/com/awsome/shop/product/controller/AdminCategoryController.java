package com.awsome.shop.product.controller;

import com.awsome.shop.product.common.Result;
import com.awsome.shop.product.dto.*;
import com.awsome.shop.product.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final CategoryService categoryService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Result<CategoryResponse> create(@Valid @RequestBody CreateCategoryRequest request) {
        return Result.success(categoryService.createCategory(request));
    }

    @PutMapping("/{id}")
    public Result<CategoryResponse> update(@PathVariable Long id,
                                           @Valid @RequestBody UpdateCategoryRequest request) {
        return Result.success(categoryService.updateCategory(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        categoryService.deleteCategory(id);
    }
}
