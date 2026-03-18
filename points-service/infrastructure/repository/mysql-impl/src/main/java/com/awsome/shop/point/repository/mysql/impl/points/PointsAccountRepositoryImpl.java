package com.awsome.shop.point.repository.mysql.impl.points;

import com.awsome.shop.point.domain.model.points.PointsAccountEntity;
import com.awsome.shop.point.repository.mysql.mapper.points.PointsAccountMapper;
import com.awsome.shop.point.repository.mysql.po.points.PointsAccountPO;
import com.awsome.shop.point.repository.points.PointsAccountRepository;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

/**
 * 积分账户仓储实现
 */
@Repository
@RequiredArgsConstructor
public class PointsAccountRepositoryImpl implements PointsAccountRepository {

    private final PointsAccountMapper pointsAccountMapper;

    @Override
    public PointsAccountEntity getByEmployeeId(Long employeeId) {
        LambdaQueryWrapper<PointsAccountPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(PointsAccountPO::getEmployeeId, employeeId);
        PointsAccountPO po = pointsAccountMapper.selectOne(wrapper);
        return po == null ? null : toEntity(po);
    }

    @Override
    public void save(PointsAccountEntity entity) {
        PointsAccountPO po = toPO(entity);
        pointsAccountMapper.insert(po);
        entity.setId(po.getId());
    }

    @Override
    public boolean deductBalance(Long employeeId, Long amount) {
        return pointsAccountMapper.deductBalance(employeeId, amount) > 0;
    }

    @Override
    public void addBalance(Long employeeId, Long amount) {
        pointsAccountMapper.addBalance(employeeId, amount);
    }

    private PointsAccountEntity toEntity(PointsAccountPO po) {
        PointsAccountEntity entity = new PointsAccountEntity();
        entity.setId(po.getId());
        entity.setEmployeeId(po.getEmployeeId());
        entity.setBalance(po.getBalance());
        entity.setTotalEarned(po.getTotalEarned());
        entity.setTotalSpent(po.getTotalSpent());
        entity.setCreatedAt(po.getCreatedAt());
        entity.setUpdatedAt(po.getUpdatedAt());
        return entity;
    }

    private PointsAccountPO toPO(PointsAccountEntity entity) {
        PointsAccountPO po = new PointsAccountPO();
        po.setId(entity.getId());
        po.setEmployeeId(entity.getEmployeeId());
        po.setBalance(entity.getBalance());
        po.setTotalEarned(entity.getTotalEarned());
        po.setTotalSpent(entity.getTotalSpent());
        return po;
    }
}
