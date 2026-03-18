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

    PageResult<ProductEntity> page(int page, int size, String name, String category, String keyword);

    void save(ProductEntity entity);

    void update(ProductEntity entity);

    void deleteById(Long id);

    /**
     * 乐观锁扣减库存
     *
     * @return 受影响行数（0 表示库存不足）
     */
    int deductStock(Long id, int quantity);

    /**
     * 恢复库存
     *
     * @return 受影响行数
     */
    int restoreStock(Long id, int quantity);
}
