package com.awsome.shop.product.service;

import com.awsome.shop.product.common.BusinessException;
import com.awsome.shop.product.common.PageResult;
import com.awsome.shop.product.dto.*;
import com.awsome.shop.product.enums.ProductErrorCode;
import com.awsome.shop.product.enums.ProductStatus;
import com.awsome.shop.product.model.ProductPO;
import com.awsome.shop.product.repository.ProductMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductMapper productMapper;
    private final CategoryService categoryService;

    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public ProductResponse createProduct(CreateProductRequest request) {
        categoryService.validateCategoryExists(request.getCategoryId());

        ProductPO po = new ProductPO();
        po.setName(request.getName());
        po.setDescription(request.getDescription());
        po.setPointsPrice(request.getPointsPrice());
        po.setStock(request.getStock());
        po.setImageUrl(request.getImageUrl());
        po.setCategoryId(request.getCategoryId());
        po.setStatus(ProductStatus.ACTIVE.name());
        productMapper.insert(po);

        return toResponse(po);
    }

    public ProductResponse updateProduct(Long id, UpdateProductRequest request) {
        ProductPO po = productMapper.selectById(id);
        if (po == null) {
            throw new BusinessException(ProductErrorCode.PRODUCT_NOT_FOUND);
        }

        if (request.getCategoryId() != null) {
            categoryService.validateCategoryExists(request.getCategoryId());
            po.setCategoryId(request.getCategoryId());
        }
        if (request.getName() != null) po.setName(request.getName());
        if (request.getDescription() != null) po.setDescription(request.getDescription());
        if (request.getPointsPrice() != null) po.setPointsPrice(request.getPointsPrice());
        if (request.getStock() != null) po.setStock(request.getStock());
        if (request.getImageUrl() != null) po.setImageUrl(request.getImageUrl());

        productMapper.updateById(po);
        return toResponse(po);
    }

    public void deleteProduct(Long id) {
        ProductPO po = productMapper.selectById(id);
        if (po == null) {
            throw new BusinessException(ProductErrorCode.PRODUCT_NOT_FOUND);
        }
        po.setStatus(ProductStatus.INACTIVE.name());
        productMapper.updateById(po);
    }

    /**
     * 员工端产品详情（仅 ACTIVE）
     */
    public ProductResponse getProductDetail(Long id) {
        ProductPO po = productMapper.selectOne(
                new LambdaQueryWrapper<ProductPO>()
                        .eq(ProductPO::getId, id)
                        .eq(ProductPO::getStatus, ProductStatus.ACTIVE.name()));
        if (po == null) {
            throw new BusinessException(ProductErrorCode.PRODUCT_NOT_FOUND);
        }
        return toResponse(po);
    }

    /**
     * 员工端产品列表（仅 ACTIVE）
     */
    public PageResult<ProductResponse> getProductList(int page, int size,
                                                       Long categoryId, String keyword) {
        int safeSize = Math.min(Math.max(size, 1), 100);
        int safePage = Math.max(page, 0);

        LambdaQueryWrapper<ProductPO> wrapper = new LambdaQueryWrapper<ProductPO>()
                .eq(ProductPO::getStatus, ProductStatus.ACTIVE.name());

        applyCategoryFilter(wrapper, categoryId);
        if (StringUtils.hasText(keyword)) {
            wrapper.like(ProductPO::getName, keyword);
        }
        wrapper.orderByDesc(ProductPO::getCreatedAt);

        Page<ProductPO> pageResult = productMapper.selectPage(
                new Page<>(safePage + 1, safeSize), wrapper);
        return toPageResult(pageResult);
    }

    /**
     * 管理员产品列表（含 INACTIVE）
     */
    public PageResult<ProductResponse> getAdminProductList(int page, int size,
                                                            Long categoryId, String keyword,
                                                            String status) {
        int safeSize = Math.min(Math.max(size, 1), 100);
        int safePage = Math.max(page, 0);

        LambdaQueryWrapper<ProductPO> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(status)) {
            wrapper.eq(ProductPO::getStatus, status);
        }
        applyCategoryFilter(wrapper, categoryId);
        if (StringUtils.hasText(keyword)) {
            wrapper.like(ProductPO::getName, keyword);
        }
        wrapper.orderByDesc(ProductPO::getCreatedAt);

        Page<ProductPO> pageResult = productMapper.selectPage(
                new Page<>(safePage + 1, safeSize), wrapper);
        return toPageResult(pageResult);
    }

    /**
     * 内部接口：获取产品信息（不限状态）
     */
    public ProductResponse getProductById(Long id) {
        ProductPO po = productMapper.selectById(id);
        if (po == null) {
            throw new BusinessException(ProductErrorCode.PRODUCT_NOT_FOUND);
        }
        return toResponse(po);
    }

    /**
     * 库存扣减（悲观锁）
     */
    @Transactional
    public void deductStock(Long productId, int quantity) {
        ProductPO po = productMapper.selectByIdForUpdate(productId);
        if (po == null) {
            throw new BusinessException(ProductErrorCode.PRODUCT_NOT_FOUND);
        }
        if (po.getStock() < quantity) {
            throw new BusinessException(ProductErrorCode.STOCK_INSUFFICIENT);
        }
        po.setStock(po.getStock() - quantity);
        productMapper.updateById(po);
    }

    /**
     * 库存恢复
     */
    @Transactional
    public void restoreStock(Long productId, int quantity) {
        ProductPO po = productMapper.selectById(productId);
        if (po == null) {
            throw new BusinessException(ProductErrorCode.PRODUCT_NOT_FOUND);
        }
        po.setStock(po.getStock() + quantity);
        productMapper.updateById(po);
    }

    // ==================== 私有方法 ====================

    private void applyCategoryFilter(LambdaQueryWrapper<ProductPO> wrapper, Long categoryId) {
        if (categoryId != null) {
            List<Long> categoryIds = categoryService.getSubCategoryIds(categoryId);
            wrapper.in(ProductPO::getCategoryId, categoryIds);
        }
    }

    private PageResult<ProductResponse> toPageResult(Page<ProductPO> page) {
        PageResult<ProductResponse> result = new PageResult<>();
        result.setCurrent(page.getCurrent());
        result.setSize(page.getSize());
        result.setTotal(page.getTotal());
        result.setPages(page.getPages());
        result.setRecords(page.getRecords().stream().map(this::toResponse).toList());
        return result;
    }

    private ProductResponse toResponse(ProductPO po) {
        ProductResponse resp = new ProductResponse();
        resp.setId(po.getId());
        resp.setName(po.getName());
        resp.setDescription(po.getDescription());
        resp.setPointsPrice(po.getPointsPrice());
        resp.setStock(po.getStock());
        resp.setImageUrl(po.getImageUrl());
        resp.setCategoryId(po.getCategoryId());
        resp.setCategoryName(categoryService.getCategoryName(po.getCategoryId()));
        resp.setStatus(po.getStatus());
        resp.setCreatedAt(po.getCreatedAt() != null ? po.getCreatedAt().format(ISO_FORMATTER) : null);
        return resp;
    }
}
