package com.awsome.shop.point.repository.mysql.impl.points;

import com.awsome.shop.point.common.dto.PageResult;
import com.awsome.shop.point.domain.model.points.PointsTransactionEntity;
import com.awsome.shop.point.domain.model.points.PointsTransactionType;
import com.awsome.shop.point.repository.mysql.mapper.points.PointsTransactionMapper;
import com.awsome.shop.point.repository.mysql.po.points.PointsTransactionPO;
import com.awsome.shop.point.repository.points.PointsTransactionRepository;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.stream.Collectors;

/**
 * 积分流水仓储实现
 */
@Repository
@RequiredArgsConstructor
public class PointsTransactionRepositoryImpl implements PointsTransactionRepository {

    private final PointsTransactionMapper pointsTransactionMapper;

    @Override
    public void save(PointsTransactionEntity entity) {
        PointsTransactionPO po = toPO(entity);
        pointsTransactionMapper.insert(po);
        entity.setId(po.getId());
    }

    @Override
    public PageResult<PointsTransactionEntity> pageByEmployeeId(Long employeeId, int page, int size) {
        LambdaQueryWrapper<PointsTransactionPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PointsTransactionPO::getEmployeeId, employeeId)
               .orderByDesc(PointsTransactionPO::getCreatedAt);

        IPage<PointsTransactionPO> result = pointsTransactionMapper.selectPage(new Page<>(page, size), wrapper);

        PageResult<PointsTransactionEntity> pageResult = new PageResult<>();
        pageResult.setCurrent(result.getCurrent());
        pageResult.setSize(result.getSize());
        pageResult.setTotal(result.getTotal());
        pageResult.setPages(result.getPages());
        pageResult.setRecords(result.getRecords().stream().map(this::toEntity).collect(Collectors.toList()));
        return pageResult;
    }

    private PointsTransactionEntity toEntity(PointsTransactionPO po) {
        PointsTransactionEntity entity = new PointsTransactionEntity();
        entity.setId(po.getId());
        entity.setEmployeeId(po.getEmployeeId());
        entity.setType(PointsTransactionType.valueOf(po.getType()));
        entity.setAmount(po.getAmount());
        entity.setBalanceAfter(po.getBalanceAfter());
        entity.setOrderId(po.getOrderId());
        entity.setOperatorId(po.getOperatorId());
        entity.setRemark(po.getRemark());
        entity.setCreatedAt(po.getCreatedAt());
        return entity;
    }

    private PointsTransactionPO toPO(PointsTransactionEntity entity) {
        PointsTransactionPO po = new PointsTransactionPO();
        po.setId(entity.getId());
        po.setEmployeeId(entity.getEmployeeId());
        po.setType(entity.getType().name());
        po.setAmount(entity.getAmount());
        po.setBalanceAfter(entity.getBalanceAfter());
        po.setOrderId(entity.getOrderId());
        po.setOperatorId(entity.getOperatorId());
        po.setRemark(entity.getRemark());
        return po;
    }
}
