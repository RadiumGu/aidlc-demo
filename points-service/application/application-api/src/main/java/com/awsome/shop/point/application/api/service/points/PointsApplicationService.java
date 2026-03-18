package com.awsome.shop.point.application.api.service.points;

import com.awsome.shop.point.application.api.dto.points.PointsBalanceDTO;
import com.awsome.shop.point.application.api.dto.points.PointsTransactionDTO;
import com.awsome.shop.point.application.api.dto.points.request.*;
import com.awsome.shop.point.common.dto.PageResult;

/**
 * 积分应用服务接口
 */
public interface PointsApplicationService {

    PointsBalanceDTO getBalance(Long employeeId);

    PageResult<PointsTransactionDTO> getTransactions(ListTransactionsRequest request);

    void adminAdd(AddPointsRequest request, Long operatorId);

    void adminDeduct(DeductPointsRequest request, Long operatorId);

    boolean deductForOrder(OrderDeductRequest request);

    void refundForOrder(OrderRefundRequest request);
}
