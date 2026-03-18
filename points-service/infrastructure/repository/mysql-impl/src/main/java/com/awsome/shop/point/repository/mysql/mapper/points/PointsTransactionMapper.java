package com.awsome.shop.point.repository.mysql.mapper.points;

import com.awsome.shop.point.repository.mysql.po.points.PointsTransactionPO;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

/**
 * 积分流水 Mapper
 */
@Mapper
public interface PointsTransactionMapper extends BaseMapper<PointsTransactionPO> {
}
