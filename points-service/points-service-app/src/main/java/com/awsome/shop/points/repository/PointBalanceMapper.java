package com.awsome.shop.points.repository;

import com.awsome.shop.points.model.PointBalancePO;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

public interface PointBalanceMapper extends BaseMapper<PointBalancePO> {

    /**
     * 悲观锁查询余额
     */
    @Select("SELECT * FROM point_balances WHERE user_id = #{userId} FOR UPDATE")
    PointBalancePO selectByUserIdForUpdate(@Param("userId") Long userId);
}
