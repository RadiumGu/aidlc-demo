package com.awsome.shop.points.service;

import com.awsome.shop.points.common.BusinessException;
import com.awsome.shop.points.common.PageResult;
import com.awsome.shop.points.dto.*;
import com.awsome.shop.points.enums.PointsErrorCode;
import com.awsome.shop.points.enums.TransactionType;
import com.awsome.shop.points.model.PointBalancePO;
import com.awsome.shop.points.model.PointTransactionPO;
import com.awsome.shop.points.repository.PointBalanceMapper;
import com.awsome.shop.points.repository.PointTransactionMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PointsService {

    private final PointBalanceMapper pointBalanceMapper;
    private final PointTransactionMapper pointTransactionMapper;

    /**
     * 初始化用户积分余额（幂等）
     */
    public PointBalanceResponse initPoints(InitPointsRequest request) {
        PointBalancePO existing = pointBalanceMapper.selectOne(
                new LambdaQueryWrapper<PointBalancePO>()
                        .eq(PointBalancePO::getUserId, request.getUserId())
        );
        if (existing != null) {
            return toBalanceResponse(existing);
        }

        PointBalancePO balance = new PointBalancePO();
        balance.setUserId(request.getUserId());
        balance.setBalance(0);
        pointBalanceMapper.insert(balance);
        return toBalanceResponse(balance);
    }

    /**
     * 查询用户积分余额
     */
    public PointBalanceResponse getBalance(Long userId) {
        return getBalanceByUserId(userId);
    }

    /**
     * 查询当前用户积分变动历史（分页）
     */
    public PageResult<PointTransactionResponse> getTransactions(Long userId, int page, int size) {
        Page<PointTransactionPO> pageParam = new Page<>(page + 1, size);
        LambdaQueryWrapper<PointTransactionPO> wrapper = new LambdaQueryWrapper<PointTransactionPO>()
                .eq(PointTransactionPO::getUserId, userId)
                .orderByDesc(PointTransactionPO::getCreatedAt);
        Page<PointTransactionPO> result = pointTransactionMapper.selectPage(pageParam, wrapper);
        return toTransactionPageResult(result);
    }

    /**
     * 管理员查看所有员工积分余额（分页）
     */
    public PageResult<UserPointResponse> getAdminBalances(int page, int size, String keyword) {
        Page<PointBalancePO> pageParam = new Page<>(page + 1, size);
        LambdaQueryWrapper<PointBalancePO> wrapper = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isBlank()) {
            try {
                Long userId = Long.parseLong(keyword.trim());
                wrapper.eq(PointBalancePO::getUserId, userId);
            } catch (NumberFormatException e) {
                // keyword 不是数字，忽略
            }
        }
        wrapper.orderByDesc(PointBalancePO::getUpdatedAt);
        Page<PointBalancePO> result = pointBalanceMapper.selectPage(pageParam, wrapper);

        PageResult<UserPointResponse> pageResult = new PageResult<>();
        pageResult.setCurrent(result.getCurrent());
        pageResult.setSize(result.getSize());
        pageResult.setTotal(result.getTotal());
        pageResult.setPages(result.getPages());
        pageResult.setRecords(result.getRecords().stream().map(po -> {
            UserPointResponse resp = new UserPointResponse();
            resp.setUserId(po.getUserId());
            resp.setBalance(po.getBalance());
            return resp;
        }).toList());
        return pageResult;
    }

    /**
     * 管理员查看指定员工积分变动明细（分页，可按类型筛选）
     */
    public PageResult<PointTransactionResponse> getAdminTransactions(Long userId, int page, int size, String type) {
        Page<PointTransactionPO> pageParam = new Page<>(page + 1, size);
        LambdaQueryWrapper<PointTransactionPO> wrapper = new LambdaQueryWrapper<PointTransactionPO>()
                .eq(PointTransactionPO::getUserId, userId);
        if (type != null && !type.isBlank()) {
            wrapper.eq(PointTransactionPO::getType, TransactionType.valueOf(type));
        }
        wrapper.orderByDesc(PointTransactionPO::getCreatedAt);
        Page<PointTransactionPO> result = pointTransactionMapper.selectPage(pageParam, wrapper);
        return toTransactionPageResult(result);
    }

    /**
     * 管理员手动调整积分（悲观锁）
     */
    @Transactional
    public PointTransactionResponse adjustPoints(AdjustPointsRequest request, Long operatorId) {
        if (request.getAmount() == 0) {
            throw new BusinessException("PARAM_001", "调整数量不能为0");
        }

        PointBalancePO balance = pointBalanceMapper.selectByUserIdForUpdate(request.getUserId());
        if (balance == null) {
            throw new BusinessException(PointsErrorCode.BALANCE_NOT_FOUND);
        }

        // 扣除场景校验余额
        if (request.getAmount() < 0 && balance.getBalance() + request.getAmount() < 0) {
            throw new BusinessException(PointsErrorCode.INSUFFICIENT_FOR_ADJUST);
        }

        int newBalance = balance.getBalance() + request.getAmount();
        balance.setBalance(newBalance);
        pointBalanceMapper.updateById(balance);

        TransactionType txType = request.getAmount() > 0 ? TransactionType.MANUAL_ADD : TransactionType.MANUAL_DEDUCT;
        PointTransactionPO tx = new PointTransactionPO();
        tx.setUserId(request.getUserId());
        tx.setType(txType);
        tx.setAmount(request.getAmount());
        tx.setBalanceAfter(newBalance);
        tx.setOperatorId(operatorId);
        tx.setRemark(request.getRemark());
        pointTransactionMapper.insert(tx);

        return toTransactionResponse(tx);
    }

    /**
     * 兑换扣除积分（悲观锁，内部接口）
     */
    @Transactional
    public PointTransactionResponse deductPoints(DeductPointsRequest request) {
        PointBalancePO balance = pointBalanceMapper.selectByUserIdForUpdate(request.getUserId());
        if (balance == null) {
            throw new BusinessException(PointsErrorCode.BALANCE_NOT_FOUND);
        }

        if (balance.getBalance() < request.getAmount()) {
            throw new BusinessException(PointsErrorCode.INSUFFICIENT_FOR_REDEEM);
        }

        int newBalance = balance.getBalance() - request.getAmount();
        balance.setBalance(newBalance);
        pointBalanceMapper.updateById(balance);

        PointTransactionPO tx = new PointTransactionPO();
        tx.setUserId(request.getUserId());
        tx.setType(TransactionType.REDEMPTION);
        tx.setAmount(-request.getAmount());
        tx.setBalanceAfter(newBalance);
        tx.setReferenceId(request.getOrderId());
        tx.setRemark("兑换扣除");
        pointTransactionMapper.insert(tx);

        return toTransactionResponse(tx);
    }

    /**
     * 兑换回滚积分（悲观锁，内部接口）
     */
    @Transactional
    public void rollbackDeduction(RollbackDeductionRequest request) {
        PointTransactionPO originalTx = pointTransactionMapper.selectById(request.getTransactionId());
        if (originalTx == null) {
            throw new BusinessException(PointsErrorCode.TRANSACTION_NOT_FOUND);
        }
        if (originalTx.getType() != TransactionType.REDEMPTION) {
            throw new BusinessException(PointsErrorCode.ONLY_REDEMPTION_ROLLBACK);
        }

        // 检查是否已回滚
        Long rollbackCount = pointTransactionMapper.selectCount(
                new LambdaQueryWrapper<PointTransactionPO>()
                        .eq(PointTransactionPO::getType, TransactionType.ROLLBACK)
                        .eq(PointTransactionPO::getReferenceId, originalTx.getReferenceId())
        );
        if (rollbackCount > 0) {
            throw new BusinessException(PointsErrorCode.ALREADY_ROLLED_BACK);
        }

        int restoreAmount = Math.abs(originalTx.getAmount());

        PointBalancePO balance = pointBalanceMapper.selectByUserIdForUpdate(originalTx.getUserId());
        if (balance == null) {
            throw new BusinessException(PointsErrorCode.BALANCE_NOT_FOUND);
        }

        int newBalance = balance.getBalance() + restoreAmount;
        balance.setBalance(newBalance);
        pointBalanceMapper.updateById(balance);

        PointTransactionPO tx = new PointTransactionPO();
        tx.setUserId(originalTx.getUserId());
        tx.setType(TransactionType.ROLLBACK);
        tx.setAmount(restoreAmount);
        tx.setBalanceAfter(newBalance);
        tx.setReferenceId(originalTx.getReferenceId());
        tx.setRemark("兑换回滚");
        pointTransactionMapper.insert(tx);
    }

    /**
     * 查询指定用户积分余额（内部接口）
     */
    public PointBalanceResponse getBalanceByUserId(Long userId) {
        PointBalancePO balance = pointBalanceMapper.selectOne(
                new LambdaQueryWrapper<PointBalancePO>()
                        .eq(PointBalancePO::getUserId, userId)
        );
        if (balance == null) {
            PointBalanceResponse resp = new PointBalanceResponse();
            resp.setUserId(userId);
            resp.setBalance(0);
            return resp;
        }
        return toBalanceResponse(balance);
    }

    // ========== 转换方法 ==========

    public StatsResponse getStats() {
        java.time.LocalDateTime monthStart = java.time.LocalDateTime.now().withDayOfMonth(1).toLocalDate().atStartOfDay();
        // Sum positive amounts (DISTRIBUTION + MANUAL_ADD) this month
        LambdaQueryWrapper<PointTransactionPO> wrapper = new LambdaQueryWrapper<PointTransactionPO>()
                .ge(PointTransactionPO::getCreatedAt, monthStart)
                .gt(PointTransactionPO::getAmount, 0)
                .in(PointTransactionPO::getType, TransactionType.DISTRIBUTION, TransactionType.MANUAL_ADD);
        java.util.List<PointTransactionPO> txs = pointTransactionMapper.selectList(wrapper);
        long total = txs.stream().mapToLong(PointTransactionPO::getAmount).sum();
        return StatsResponse.builder().monthDistributed(total).build();
    }

    private PointBalanceResponse toBalanceResponse(PointBalancePO po) {
        PointBalanceResponse resp = new PointBalanceResponse();
        resp.setUserId(po.getUserId());
        resp.setBalance(po.getBalance());
        return resp;
    }

    private PointTransactionResponse toTransactionResponse(PointTransactionPO po) {
        PointTransactionResponse resp = new PointTransactionResponse();
        resp.setId(po.getId());
        resp.setUserId(po.getUserId());
        resp.setType(po.getType().name());
        resp.setAmount(po.getAmount());
        resp.setBalanceAfter(po.getBalanceAfter());
        resp.setReferenceId(po.getReferenceId());
        resp.setOperatorId(po.getOperatorId());
        resp.setRemark(po.getRemark());
        resp.setCreatedAt(po.getCreatedAt());
        return resp;
    }

    private PageResult<PointTransactionResponse> toTransactionPageResult(Page<PointTransactionPO> page) {
        PageResult<PointTransactionResponse> result = new PageResult<>();
        result.setCurrent(page.getCurrent());
        result.setSize(page.getSize());
        result.setTotal(page.getTotal());
        result.setPages(page.getPages());
        result.setRecords(page.getRecords().stream().map(this::toTransactionResponse).toList());
        return result;
    }
}
