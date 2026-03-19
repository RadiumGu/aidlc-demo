package com.awsome.shop.product.dto;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
public class CategoryTreeNode {
    private Long id;
    private String name;
    private Integer sortOrder;
    private String status;
    private Long productCount;
    private List<CategoryTreeNode> children = new ArrayList<>();
}
