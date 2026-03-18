package com.awsome.shop.point.domain.service.points;

import com.awsome.shop.point.common.dto.PageResult;
import com.awsome.shop.point.domain.model.points.PointsAccountEntity;
import com.awsome.shop.point.domain.model.points.PointsTransactionEntity;

/**
 * 积分领域服务接口
 */
public interface PointsDomainService {

    /**
     * 查询积分账户
     */
    PointsAccountEntity getAccount(Long employeeId);

    /**
     * 分页查询积分流水
     */
    PageResult<PointsTransactionEntity> getTransactions(Long employeeId, int page, int size);

    /**
     * 管理员发放积分
     */
    void adminAdd(Long employeeId, Long amount, Long operatorId, String remark);

    /**
     * 管理员扣除积分
     */
    void adminDeduct(Long employeeId, Long amount, Long operatorId, String remark);

    /**
     * 订单扣减积分（乐观锁）
     *
     * @return true 扣减成功, false 余额不足
     */
    boolean deductForOrder(Long employeeId, Long amount, String orderId);

    /**
     * 订单退还积分
     */
    void refundForOrder(Long employeeId, Long amount, String orderId);
}
