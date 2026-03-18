package com.awsome.shop.order.repository.mysql.impl.order;

import com.awsome.shop.order.common.dto.PageResult;
import com.awsome.shop.order.domain.model.order.OrderEntity;
import com.awsome.shop.order.domain.model.order.OrderStatus;
import com.awsome.shop.order.repository.mysql.mapper.order.OrderMapper;
import com.awsome.shop.order.repository.mysql.po.order.OrderPO;
import com.awsome.shop.order.repository.order.OrderRepository;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.stream.Collectors;

/**
 * 订单仓储实现
 */
@Repository
@RequiredArgsConstructor
public class OrderRepositoryImpl implements OrderRepository {

    private final OrderMapper orderMapper;

    @Override
    public OrderEntity getById(Long id) {
        OrderPO po = orderMapper.selectById(id);
        return po == null ? null : toEntity(po);
    }

    @Override
    public PageResult<OrderEntity> page(int page, int size, Long employeeId, OrderStatus status) {
        LambdaQueryWrapper<OrderPO> wrapper = new LambdaQueryWrapper<>();
        if (employeeId != null) {
            wrapper.eq(OrderPO::getEmployeeId, employeeId);
        }
        if (status != null) {
            wrapper.eq(OrderPO::getStatus, status.name());
        }
        wrapper.orderByDesc(OrderPO::getCreatedAt);

        IPage<OrderPO> result = orderMapper.selectPage(new Page<>(page, size), wrapper);

        PageResult<OrderEntity> pageResult = new PageResult<>();
        pageResult.setCurrent(result.getCurrent());
        pageResult.setSize(result.getSize());
        pageResult.setTotal(result.getTotal());
        pageResult.setPages(result.getPages());
        pageResult.setRecords(result.getRecords().stream().map(this::toEntity).collect(Collectors.toList()));
        return pageResult;
    }

    @Override
    public void save(OrderEntity entity) {
        OrderPO po = toPO(entity);
        orderMapper.insert(po);
        entity.setId(po.getId());
    }

    @Override
    public void update(OrderEntity entity) {
        OrderPO po = toPO(entity);
        orderMapper.updateById(po);
    }

    private OrderEntity toEntity(OrderPO po) {
        OrderEntity entity = new OrderEntity();
        entity.setId(po.getId());
        entity.setOrderNo(po.getOrderNo());
        entity.setEmployeeId(po.getEmployeeId());
        entity.setProductId(po.getProductId());
        entity.setProductName(po.getProductName());
        entity.setProductImage(po.getProductImage());
        entity.setPointsCost(po.getPointsCost());
        entity.setQuantity(po.getQuantity());
        entity.setTotalPoints(po.getTotalPoints());
        entity.setStatus(OrderStatus.valueOf(po.getStatus()));
        entity.setRemark(po.getRemark());
        entity.setCreatedAt(po.getCreatedAt());
        entity.setUpdatedAt(po.getUpdatedAt());
        return entity;
    }

    private OrderPO toPO(OrderEntity entity) {
        OrderPO po = new OrderPO();
        po.setId(entity.getId());
        po.setOrderNo(entity.getOrderNo());
        po.setEmployeeId(entity.getEmployeeId());
        po.setProductId(entity.getProductId());
        po.setProductName(entity.getProductName());
        po.setProductImage(entity.getProductImage());
        po.setPointsCost(entity.getPointsCost());
        po.setQuantity(entity.getQuantity());
        po.setTotalPoints(entity.getTotalPoints());
        po.setStatus(entity.getStatus() != null ? entity.getStatus().name() : null);
        po.setRemark(entity.getRemark());
        return po;
    }
}
