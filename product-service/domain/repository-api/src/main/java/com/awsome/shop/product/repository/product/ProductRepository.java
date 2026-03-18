package com.awsome.shop.product.repository.product;

import com.awsome.shop.product.common.dto.PageResult;
import com.awsome.shop.product.domain.model.product.ProductEntity;

/**
 * Product 仓储接口
 */
public interface ProductRepository {

    ProductEntity getById(Long id);

    ProductEntity getBySku(String sku);

    PageResult<ProductEntity> page(int page, int size, String name, String category);

    void save(ProductEntity entity);

    void update(ProductEntity entity);

    void deleteById(Long id);
}
