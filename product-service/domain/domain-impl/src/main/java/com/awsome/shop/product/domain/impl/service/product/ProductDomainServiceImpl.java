package com.awsome.shop.product.domain.impl.service.product;

import com.awsome.shop.product.common.dto.PageResult;
import com.awsome.shop.product.common.enums.SampleErrorCode;
import com.awsome.shop.product.common.exception.BusinessException;
import com.awsome.shop.product.domain.model.product.ProductEntity;
import com.awsome.shop.product.domain.service.product.ProductDomainService;
import com.awsome.shop.product.repository.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Product 领域服务实现
 */
@Service
@RequiredArgsConstructor
public class ProductDomainServiceImpl implements ProductDomainService {

    private final ProductRepository productRepository;

    @Override
    public ProductEntity getById(Long id) {
        ProductEntity entity = productRepository.getById(id);
        if (entity == null) {
            throw new BusinessException(SampleErrorCode.RESOURCE_NOT_FOUND);
        }
        return entity;
    }

    @Override
    public PageResult<ProductEntity> page(int page, int size, String name, String category) {
        return productRepository.page(page, size, name, category);
    }

    @Override
    public PageResult<ProductEntity> page(int page, int size, String name, String category, String keyword) {
        return productRepository.page(page, size, name, category, keyword);
    }

    @Override
    @Transactional
    public ProductEntity create(String name, String sku, String category, String brand,
                                Integer pointsPrice, BigDecimal marketPrice, Integer stock,
                                Integer status, String description, String imageUrl,
                                String subtitle, String deliveryMethod, String serviceGuarantee,
                                String promotion, String colors, List<Map<String, String>> specs) {
        // SKU 唯一性校验
        ProductEntity existing = productRepository.getBySku(sku);
        if (existing != null) {
            throw new BusinessException(SampleErrorCode.RESOURCE_ALREADY_EXISTS, sku);
        }

        ProductEntity entity = new ProductEntity();
        entity.setName(name);
        entity.setSku(sku);
        entity.setCategory(category);
        entity.setBrand(brand);
        entity.setPointsPrice(pointsPrice);
        entity.setMarketPrice(marketPrice);
        entity.setStock(stock != null ? stock : 0);
        entity.setStatus(status != null ? status : 0);
        entity.setDescription(description);
        entity.setImageUrl(imageUrl);
        entity.setSubtitle(subtitle);
        entity.setDeliveryMethod(deliveryMethod);
        entity.setServiceGuarantee(serviceGuarantee);
        entity.setPromotion(promotion);
        entity.setColors(colors);
        entity.setSpecs(specs);

        productRepository.save(entity);
        return productRepository.getById(entity.getId());
    }

    @Override
    @Transactional
    public ProductEntity update(Long id, String name, String sku, String category, String brand,
                                Integer pointsPrice, BigDecimal marketPrice, Integer stock,
                                Integer status, String description, String imageUrl,
                                String subtitle, String deliveryMethod, String serviceGuarantee,
                                String promotion, String colors, List<Map<String, String>> specs) {
        ProductEntity entity = getById(id);

        // 如果 SKU 变更，校验唯一性
        if (sku != null && !sku.equals(entity.getSku())) {
            ProductEntity existing = productRepository.getBySku(sku);
            if (existing != null) {
                throw new BusinessException(SampleErrorCode.RESOURCE_ALREADY_EXISTS, sku);
            }
        }

        entity.updateInfo(name, sku, category, brand, pointsPrice, marketPrice, stock,
                status, description, imageUrl, subtitle, deliveryMethod, serviceGuarantee,
                promotion, colors, specs);

        productRepository.update(entity);
        return productRepository.getById(id);
    }

    @Override
    @Transactional
    public void updateStatus(Long id, Integer status) {
        ProductEntity entity = getById(id);
        entity.setStatus(status);
        productRepository.update(entity);
    }

    @Override
    @Transactional
    public void deductStock(Long id, int quantity) {
        // 乐观锁扣减：WHERE id = ? AND stock >= quantity
        int rows = productRepository.deductStock(id, quantity);
        if (rows == 0) {
            throw new BusinessException(SampleErrorCode.OPERATION_NOT_ALLOWED);
        }
    }

    @Override
    @Transactional
    public void restoreStock(Long id, int quantity) {
        int rows = productRepository.restoreStock(id, quantity);
        if (rows == 0) {
            throw new BusinessException(SampleErrorCode.RESOURCE_NOT_FOUND);
        }
    }
}
