package com.awsome.shop.product.controller;

import com.awsome.shop.product.common.Result;
import com.awsome.shop.product.dto.CategoryTreeNode;
import com.awsome.shop.product.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/tree")
    public Result<List<CategoryTreeNode>> tree() {
        return Result.success(categoryService.getCategoryTree());
    }
}
