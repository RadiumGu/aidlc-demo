package com.awsome.shop.point.repository.points;

import com.awsome.shop.point.common.dto.PageResult;
import com.awsome.shop.point.domain.model.points.PointsTransactionEntity;

/**
 * 积分流水仓储接口
 */
public interface PointsTransactionRepository {

    void save(PointsTransactionEntity entity);

    PageResult<PointsTransactionEntity> pageByEmployeeId(Long employeeId, int page, int size);
}
