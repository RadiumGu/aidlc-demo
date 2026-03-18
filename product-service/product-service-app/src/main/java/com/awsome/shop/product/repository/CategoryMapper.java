package com.awsome.shop.product.repository;

import com.awsome.shop.product.model.CategoryPO;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CategoryMapper extends BaseMapper<CategoryPO> {
}
