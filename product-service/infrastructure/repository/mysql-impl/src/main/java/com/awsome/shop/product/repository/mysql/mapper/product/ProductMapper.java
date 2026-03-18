package com.awsome.shop.product.repository.mysql.mapper.product;

import com.awsome.shop.product.repository.mysql.po.product.ProductPO;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * Product Mapper 接口
 */
@Mapper
public interface ProductMapper extends BaseMapper<ProductPO> {

    /**
     * 分页查询
     *
     * @param page     MyBatis-Plus 分页对象
     * @param name     名称模糊查询条件（可为 null）
     * @param category 分类精确筛选条件（可为 null）
     * @return 分页结果
     */
    IPage<ProductPO> selectPage(IPage<ProductPO> page, @Param("name") String name, @Param("category") String category);

    /**
     * 分页查询（支持关键词搜索）
     *
     * @param page     MyBatis-Plus 分页对象
     * @param name     名称模糊查询条件（可为 null）
     * @param category 分类精确筛选条件（可为 null）
     * @param keyword  关键词模糊搜索（匹配 name 和 description，可为 null）
     * @return 分页结果
     */
    IPage<ProductPO> selectPageWithKeyword(IPage<ProductPO> page, @Param("name") String name,
                                            @Param("category") String category, @Param("keyword") String keyword);

    /**
     * 乐观锁扣减库存
     *
     * @param id       商品ID
     * @param quantity 扣减数量
     * @return 受影响行数（0 表示库存不足）
     */
    int deductStock(@Param("id") Long id, @Param("quantity") int quantity);

    /**
     * 恢复库存
     *
     * @param id       商品ID
     * @param quantity 恢复数量
     * @return 受影响行数
     */
    int restoreStock(@Param("id") Long id, @Param("quantity") int quantity);
}
