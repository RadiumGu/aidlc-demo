package com.awsome.shop.order.repository;

import com.awsome.shop.order.model.OrderPO;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

/**
 * 兑换订单 Mapper
 */
@Mapper
public interface OrderMapper extends BaseMapper<OrderPO> {
}
