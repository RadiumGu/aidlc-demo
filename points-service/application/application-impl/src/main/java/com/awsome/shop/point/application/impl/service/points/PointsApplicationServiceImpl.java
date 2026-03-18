package com.awsome.shop.point.application.impl.service.points;

import com.awsome.shop.point.application.api.dto.points.PointsBalanceDTO;
import com.awsome.shop.point.application.api.dto.points.PointsTransactionDTO;
import com.awsome.shop.point.application.api.dto.points.request.*;
import com.awsome.shop.point.application.api.service.points.PointsApplicationService;
import com.awsome.shop.point.common.dto.PageResult;
import com.awsome.shop.point.domain.model.points.PointsAccountEntity;
import com.awsome.shop.point.domain.model.points.PointsTransactionEntity;
import com.awsome.shop.point.domain.service.points.PointsDomainService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 积分应用服务实现
 */
@Service
@RequiredArgsConstructor
public class PointsApplicationServiceImpl implements PointsApplicationService {

    private final PointsDomainService pointsDomainService;

    @Override
    public PointsBalanceDTO getBalance(Long employeeId) {
        PointsAccountEntity account = pointsDomainService.getAccount(employeeId);
        return toBalanceDTO(account);
    }

    @Override
    public PageResult<PointsTransactionDTO> getTransactions(ListTransactionsRequest request) {
        PageResult<PointsTransactionEntity> page = pointsDomainService.getTransactions(
                request.getEmployeeId(), request.getPageNum(), request.getPageSize());
        return page.convert(this::toTransactionDTO);
    }

    @Override
    public void adminAdd(AddPointsRequest request, Long operatorId) {
        pointsDomainService.adminAdd(request.getEmployeeId(), request.getAmount(), operatorId, request.getRemark());
    }

    @Override
    public void adminDeduct(DeductPointsRequest request, Long operatorId) {
        pointsDomainService.adminDeduct(request.getEmployeeId(), request.getAmount(), operatorId, request.getRemark());
    }

    @Override
    public boolean deductForOrder(OrderDeductRequest request) {
        return pointsDomainService.deductForOrder(request.getEmployeeId(), request.getAmount(), request.getOrderId());
    }

    @Override
    public void refundForOrder(OrderRefundRequest request) {
        pointsDomainService.refundForOrder(request.getEmployeeId(), request.getAmount(), request.getOrderId());
    }

    private PointsBalanceDTO toBalanceDTO(PointsAccountEntity account) {
        PointsBalanceDTO dto = new PointsBalanceDTO();
        dto.setEmployeeId(account.getEmployeeId());
        dto.setBalance(account.getBalance());
        dto.setTotalEarned(account.getTotalEarned());
        dto.setTotalSpent(account.getTotalSpent());
        return dto;
    }

    private PointsTransactionDTO toTransactionDTO(PointsTransactionEntity entity) {
        PointsTransactionDTO dto = new PointsTransactionDTO();
        dto.setId(entity.getId());
        dto.setEmployeeId(entity.getEmployeeId());
        dto.setType(entity.getType().name());
        dto.setAmount(entity.getAmount());
        dto.setBalanceAfter(entity.getBalanceAfter());
        dto.setOrderId(entity.getOrderId());
        dto.setOperatorId(entity.getOperatorId());
        dto.setRemark(entity.getRemark());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
