package com.awsome.shop.product.domain.service.product;

import com.awsome.shop.product.common.dto.PageResult;
import com.awsome.shop.product.domain.model.product.ProductEntity;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Product 领域服务接口
 */
public interface ProductDomainService {

    ProductEntity getById(Long id);

    PageResult<ProductEntity> page(int page, int size, String name, String category);

    PageResult<ProductEntity> page(int page, int size, String name, String category, String keyword);

    ProductEntity create(String name, String sku, String category, String brand,
                         Integer pointsPrice, BigDecimal marketPrice, Integer stock,
                         Integer status, String description, String imageUrl,
                         String subtitle, String deliveryMethod, String serviceGuarantee,
                         String promotion, String colors, List<Map<String, String>> specs);

    ProductEntity update(Long id, String name, String sku, String category, String brand,
                         Integer pointsPrice, BigDecimal marketPrice, Integer stock,
                         Integer status, String description, String imageUrl,
                         String subtitle, String deliveryMethod, String serviceGuarantee,
                         String promotion, String colors, List<Map<String, String>> specs);

    void updateStatus(Long id, Integer status);

    void deductStock(Long id, int quantity);

    void restoreStock(Long id, int quantity);
}
