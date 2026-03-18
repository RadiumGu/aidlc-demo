package com.awsome.shop.point.repository.points;

import com.awsome.shop.point.domain.model.points.PointsAccountEntity;

/**
 * 积分账户仓储接口
 */
public interface PointsAccountRepository {

    PointsAccountEntity getByEmployeeId(Long employeeId);

    void save(PointsAccountEntity entity);

    /**
     * 乐观锁扣减余额
     *
     * @param employeeId 员工ID
     * @param amount     扣减金额
     * @return true 扣减成功, false 余额不足
     */
    boolean deductBalance(Long employeeId, Long amount);

    /**
     * 增加余额
     *
     * @param employeeId 员工ID
     * @param amount     增加金额
     */
    void addBalance(Long employeeId, Long amount);
}
