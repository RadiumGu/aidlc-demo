package com.awsome.shop.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateCategoryRequest {

    @NotBlank(message = "分类名称不能为空")
    @Size(max = 100, message = "分类名称最多100个字符")
    private String name;

    private Long parentId;

    private Integer sortOrder = 0;
}
