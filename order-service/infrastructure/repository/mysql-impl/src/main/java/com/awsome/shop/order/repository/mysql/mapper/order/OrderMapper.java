package com.awsome.shop.order.repository.mysql.mapper.order;

import com.awsome.shop.order.repository.mysql.po.order.OrderPO;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

/**
 * 订单 Mapper 接口
 */
@Mapper
public interface OrderMapper extends BaseMapper<OrderPO> {
}
