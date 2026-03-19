package com.awsome.shop.product.service;

import com.awsome.shop.product.common.BusinessException;
import com.awsome.shop.product.dto.*;
import com.awsome.shop.product.enums.CategoryErrorCode;
import com.awsome.shop.product.enums.ProductStatus;
import com.awsome.shop.product.model.CategoryPO;
import com.awsome.shop.product.model.ProductPO;
import com.awsome.shop.product.repository.CategoryMapper;
import com.awsome.shop.product.repository.ProductMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryMapper categoryMapper;
    private final ProductMapper productMapper;

    public CategoryResponse createCategory(CreateCategoryRequest request) {
        // 层级校验
        if (request.getParentId() != null) {
            CategoryPO parent = categoryMapper.selectById(request.getParentId());
            if (parent == null) {
                throw new BusinessException(CategoryErrorCode.CATEGORY_NOT_FOUND);
            }
            // 父分类必须是一级分类（parentId = null）
            if (parent.getParentId() != null) {
                throw new BusinessException(CategoryErrorCode.CATEGORY_LEVEL_EXCEEDED);
            }
        }

        CategoryPO po = new CategoryPO();
        po.setName(request.getName());
        po.setParentId(request.getParentId());
        po.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);
        categoryMapper.insert(po);

        return toResponse(po);
    }

    public CategoryResponse updateCategory(Long id, UpdateCategoryRequest request) {
        CategoryPO po = categoryMapper.selectById(id);
        if (po == null) {
            throw new BusinessException(CategoryErrorCode.CATEGORY_NOT_FOUND);
        }

        // 层级校验（如果修改了 parentId）
        if (request.getParentId() != null) {
            CategoryPO parent = categoryMapper.selectById(request.getParentId());
            if (parent == null) {
                throw new BusinessException(CategoryErrorCode.CATEGORY_NOT_FOUND);
            }
            if (parent.getParentId() != null) {
                throw new BusinessException(CategoryErrorCode.CATEGORY_LEVEL_EXCEEDED);
            }
            // 不允许将有子分类的一级分类移动到其他分类下
            if (po.getParentId() == null) {
                long childCount = categoryMapper.selectCount(
                        new LambdaQueryWrapper<CategoryPO>().eq(CategoryPO::getParentId, id));
                if (childCount > 0) {
                    throw new BusinessException(CategoryErrorCode.CATEGORY_HAS_CHILDREN,
                            "该分类有子分类，不能移动到其他分类下");
                }
            }
            po.setParentId(request.getParentId());
        }

        if (request.getName() != null) {
            po.setName(request.getName());
        }
        if (request.getSortOrder() != null) {
            po.setSortOrder(request.getSortOrder());
        }
        if (request.getStatus() != null) {
            po.setStatus(request.getStatus());
        }

        categoryMapper.updateById(po);
        return toResponse(po);
    }

    public void deleteCategory(Long id) {
        CategoryPO po = categoryMapper.selectById(id);
        if (po == null) {
            throw new BusinessException(CategoryErrorCode.CATEGORY_NOT_FOUND);
        }

        // 检查子分类
        long childCount = categoryMapper.selectCount(
                new LambdaQueryWrapper<CategoryPO>().eq(CategoryPO::getParentId, id));
        if (childCount > 0) {
            throw new BusinessException(CategoryErrorCode.CATEGORY_HAS_CHILDREN);
        }

        // 检查关联的 ACTIVE 产品
        long productCount = productMapper.selectCount(
                new LambdaQueryWrapper<ProductPO>()
                        .eq(ProductPO::getCategoryId, id)
                        .eq(ProductPO::getStatus, ProductStatus.ACTIVE.name()));
        if (productCount > 0) {
            throw new BusinessException(CategoryErrorCode.CATEGORY_HAS_PRODUCTS);
        }

        categoryMapper.deleteById(id);
    }

    public List<CategoryTreeNode> getCategoryTree() {
        List<CategoryPO> all = categoryMapper.selectList(
                new LambdaQueryWrapper<CategoryPO>()
                        .orderByAsc(CategoryPO::getSortOrder)
                        .orderByAsc(CategoryPO::getId));

        // 统计每个分类下的商品数量
        List<ProductPO> allProducts = productMapper.selectList(
                new LambdaQueryWrapper<ProductPO>().select(ProductPO::getCategoryId));
        Map<Long, Long> productCountMap = allProducts.stream()
                .collect(Collectors.groupingBy(ProductPO::getCategoryId, Collectors.counting()));

        // 按 parentId 分组
        Map<Long, List<CategoryPO>> childrenMap = all.stream()
                .filter(c -> c.getParentId() != null)
                .collect(Collectors.groupingBy(CategoryPO::getParentId));

        // 构建树
        return all.stream()
                .filter(c -> c.getParentId() == null)
                .map(c -> {
                    CategoryTreeNode node = new CategoryTreeNode();
                    node.setId(c.getId());
                    node.setName(c.getName());
                    node.setSortOrder(c.getSortOrder());
                    node.setStatus(c.getStatus() != null ? c.getStatus() : "ACTIVE");
                    List<CategoryPO> children = childrenMap.getOrDefault(c.getId(), Collections.emptyList());
                    // 父类目商品数 = 自身 + 所有子类目
                    long parentCount = productCountMap.getOrDefault(c.getId(), 0L);
                    node.setChildren(children.stream().map(child -> {
                        CategoryTreeNode childNode = new CategoryTreeNode();
                        childNode.setId(child.getId());
                        childNode.setName(child.getName());
                        childNode.setSortOrder(child.getSortOrder());
                        childNode.setStatus(child.getStatus() != null ? child.getStatus() : "ACTIVE");
                        childNode.setProductCount(productCountMap.getOrDefault(child.getId(), 0L));
                        return childNode;
                    }).collect(Collectors.toList()));
                    long childrenTotal = node.getChildren().stream().mapToLong(ch -> ch.getProductCount() != null ? ch.getProductCount() : 0).sum();
                    node.setProductCount(parentCount + childrenTotal);
                    return node;
                })
                .collect(Collectors.toList());
    }

    /**
     * 获取分类名称（内部使用）
     */
    public String getCategoryName(Long categoryId) {
        if (categoryId == null) return null;
        CategoryPO po = categoryMapper.selectById(categoryId);
        return po != null ? po.getName() : null;
    }

    /**
     * 获取子分类 ID 列表（含自身），用于产品筛选
     */
    public List<Long> getSubCategoryIds(Long categoryId) {
        List<Long> ids = new ArrayList<>();
        ids.add(categoryId);
        List<CategoryPO> children = categoryMapper.selectList(
                new LambdaQueryWrapper<CategoryPO>().eq(CategoryPO::getParentId, categoryId));
        for (CategoryPO child : children) {
            ids.add(child.getId());
        }
        return ids;
    }

    /**
     * 校验分类是否存在
     */
    public void validateCategoryExists(Long categoryId) {
        if (categoryMapper.selectById(categoryId) == null) {
            throw new BusinessException(CategoryErrorCode.CATEGORY_NOT_FOUND);
        }
    }

    private CategoryResponse toResponse(CategoryPO po) {
        CategoryResponse resp = new CategoryResponse();
        resp.setId(po.getId());
        resp.setName(po.getName());
        resp.setParentId(po.getParentId());
        resp.setSortOrder(po.getSortOrder());
        return resp;
    }
}
