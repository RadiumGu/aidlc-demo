package com.awsome.shop.point.domain.impl.service.points;

import com.awsome.shop.point.common.dto.PageResult;
import com.awsome.shop.point.common.enums.PointsErrorCode;
import com.awsome.shop.point.common.exception.BusinessException;
import com.awsome.shop.point.domain.model.points.PointsAccountEntity;
import com.awsome.shop.point.domain.model.points.PointsTransactionEntity;
import com.awsome.shop.point.domain.model.points.PointsTransactionType;
import com.awsome.shop.point.domain.service.points.PointsDomainService;
import com.awsome.shop.point.repository.points.PointsAccountRepository;
import com.awsome.shop.point.repository.points.PointsTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 积分领域服务实现
 */
@Service
@RequiredArgsConstructor
public class PointsDomainServiceImpl implements PointsDomainService {

    private final PointsAccountRepository pointsAccountRepository;
    private final PointsTransactionRepository pointsTransactionRepository;

    @Override
    public PointsAccountEntity getAccount(Long employeeId) {
        PointsAccountEntity account = pointsAccountRepository.getByEmployeeId(employeeId);
        if (account == null) {
            throw new BusinessException(PointsErrorCode.ACCOUNT_NOT_FOUND);
        }
        return account;
    }

    @Override
    public PageResult<PointsTransactionEntity> getTransactions(Long employeeId, int page, int size) {
        return pointsTransactionRepository.pageByEmployeeId(employeeId, page, size);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void adminAdd(Long employeeId, Long amount, Long operatorId, String remark) {
        pointsAccountRepository.addBalance(employeeId, amount);
        PointsAccountEntity account = getAccount(employeeId);

        PointsTransactionEntity tx = new PointsTransactionEntity();
        tx.setEmployeeId(employeeId);
        tx.setType(PointsTransactionType.ADMIN_ADD);
        tx.setAmount(amount);
        tx.setBalanceAfter(account.getBalance());
        tx.setOperatorId(operatorId);
        tx.setRemark(remark);
        pointsTransactionRepository.save(tx);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void adminDeduct(Long employeeId, Long amount, Long operatorId, String remark) {
        boolean success = pointsAccountRepository.deductBalance(employeeId, amount);
        if (!success) {
            throw new BusinessException(PointsErrorCode.INSUFFICIENT_BALANCE);
        }
        PointsAccountEntity account = getAccount(employeeId);

        PointsTransactionEntity tx = new PointsTransactionEntity();
        tx.setEmployeeId(employeeId);
        tx.setType(PointsTransactionType.ADMIN_DEDUCT);
        tx.setAmount(amount);
        tx.setBalanceAfter(account.getBalance());
        tx.setOperatorId(operatorId);
        tx.setRemark(remark);
        pointsTransactionRepository.save(tx);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deductForOrder(Long employeeId, Long amount, String orderId) {
        boolean success = pointsAccountRepository.deductBalance(employeeId, amount);
        if (!success) {
            return false;
        }
        PointsAccountEntity account = getAccount(employeeId);

        PointsTransactionEntity tx = new PointsTransactionEntity();
        tx.setEmployeeId(employeeId);
        tx.setType(PointsTransactionType.SPEND);
        tx.setAmount(amount);
        tx.setBalanceAfter(account.getBalance());
        tx.setOrderId(orderId);
        tx.setRemark("订单扣减");
        pointsTransactionRepository.save(tx);
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void refundForOrder(Long employeeId, Long amount, String orderId) {
        pointsAccountRepository.addBalance(employeeId, amount);
        PointsAccountEntity account = getAccount(employeeId);

        PointsTransactionEntity tx = new PointsTransactionEntity();
        tx.setEmployeeId(employeeId);
        tx.setType(PointsTransactionType.EARN);
        tx.setAmount(amount);
        tx.setBalanceAfter(account.getBalance());
        tx.setOrderId(orderId);
        tx.setRemark("订单退还");
        pointsTransactionRepository.save(tx);
    }
}
