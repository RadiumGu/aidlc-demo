package com.awsome.shop.product.application.api.service.product;

import com.awsome.shop.product.application.api.dto.product.ProductDTO;
import com.awsome.shop.product.application.api.dto.product.request.CreateProductRequest;
import com.awsome.shop.product.application.api.dto.product.request.ListProductRequest;
import com.awsome.shop.product.common.dto.PageResult;

/**
 * Product 应用服务接口
 */
public interface ProductApplicationService {

    PageResult<ProductDTO> list(ListProductRequest request);

    ProductDTO create(CreateProductRequest request);
}
