package com.awsome.shop.product.repository;

import com.awsome.shop.product.model.ProductPO;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface ProductMapper extends BaseMapper<ProductPO> {

    /**
     * 悲观锁查询产品（SELECT FOR UPDATE）
     */
    @Select("SELECT * FROM products WHERE id = #{id} FOR UPDATE")
    ProductPO selectByIdForUpdate(Long id);
}
