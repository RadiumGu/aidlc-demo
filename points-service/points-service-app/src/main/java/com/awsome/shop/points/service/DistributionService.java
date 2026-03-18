package com.awsome.shop.points.service;

import com.awsome.shop.points.enums.TransactionType;
import com.awsome.shop.points.model.DistributionBatchPO;
import com.awsome.shop.points.model.PointBalancePO;
import com.awsome.shop.points.model.PointTransactionPO;
import com.awsome.shop.points.repository.DistributionBatchMapper;
import com.awsome.shop.points.repository.PointBalanceMapper;
import com.awsome.shop.points.repository.PointTransactionMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DistributionService {

    private final PointBalanceMapper pointBalanceMapper;
    private final PointTransactionMapper pointTransactionMapper;
    private final DistributionBatchMapper distributionBatchMapper;
    private final ConfigService configService;

    /**
     * 执行积分发放主流程
     */
    public void executeDistribution() {
        // 1. 检查是否有未完成的批次（补发）
        DistributionBatchPO runningBatch = distributionBatchMapper.selectOne(
                new LambdaQueryWrapper<DistributionBatchPO>()
                        .eq(DistributionBatchPO::getStatus, "RUNNING")
                        .orderByDesc(DistributionBatchPO::getStartedAt)
                        .last("LIMIT 1")
        );
        if (runningBatch != null) {
            log.info("发现未完成批次 id={}，执行补发", runningBatch.getId());
            resumeDistribution(runningBatch);
            return;
        }

        // 2. 读取发放配置
        int amount = configService.getDistributionAmount();

        // 3. 查询所有余额记录
        List<PointBalancePO> allBalances = pointBalanceMapper.selectList(null);
        if (allBalances.isEmpty()) {
            log.info("无用户需要发放积分");
            return;
        }

        // 4. 创建批次记录
        DistributionBatchPO batch = new DistributionBatchPO();
        batch.setDistributionAmount(amount);
        batch.setTotalCount(allBalances.size());
        batch.setSuccessCount(0);
        batch.setFailCount(0);
        batch.setStatus("RUNNING");
        distributionBatchMapper.insert(batch);

        // 5. 逐条发放
        String remark = String.format("系统自动发放 - %s",
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy年MM月")));
        int successCount = 0;
        int failCount = 0;

        for (PointBalancePO balancePO : allBalances) {
            try {
                distributeToUser(balancePO.getUserId(), amount, remark);
                successCount++;
            } catch (Exception e) {
                failCount++;
                log.error("用户 {} 积分发放失败: {}", balancePO.getUserId(), e.getMessage());
            }
        }

        // 6. 更新批次状态
        batch.setSuccessCount(successCount);
        batch.setFailCount(failCount);
        batch.setStatus(failCount == 0 ? "COMPLETED" : "FAILED");
        batch.setCompletedAt(LocalDateTime.now());
        distributionBatchMapper.updateById(batch);

        log.info("积分发放完成: 总人数={}, 成功={}, 失败={}", allBalances.size(), successCount, failCount);
    }

    /**
     * 补发逻辑：恢复未完成的批次
     */
    private void resumeDistribution(DistributionBatchPO batch) {
        int amount = batch.getDistributionAmount();

        // 查询所有用户
        List<PointBalancePO> allBalances = pointBalanceMapper.selectList(null);

        // 查询该批次时间段内已发放的用户
        Set<Long> distributedUserIds = pointTransactionMapper.selectList(
                new LambdaQueryWrapper<PointTransactionPO>()
                        .eq(PointTransactionPO::getType, TransactionType.DISTRIBUTION)
                        .ge(PointTransactionPO::getCreatedAt, batch.getStartedAt())
        ).stream().map(PointTransactionPO::getUserId).collect(Collectors.toSet());

        // 计算差集
        List<PointBalancePO> pendingUsers = allBalances.stream()
                .filter(b -> !distributedUserIds.contains(b.getUserId()))
                .toList();

        if (pendingUsers.isEmpty()) {
            log.info("补发检查：所有用户已发放完毕");
            batch.setStatus("COMPLETED");
            batch.setCompletedAt(LocalDateTime.now());
            distributionBatchMapper.updateById(batch);
            return;
        }

        String remark = String.format("系统自动发放（补发） - %s",
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy年MM月")));
        int successCount = batch.getSuccessCount();
        int failCount = batch.getFailCount();

        for (PointBalancePO balancePO : pendingUsers) {
            try {
                distributeToUser(balancePO.getUserId(), amount, remark);
                successCount++;
            } catch (Exception e) {
                failCount++;
                log.error("补发用户 {} 积分失败: {}", balancePO.getUserId(), e.getMessage());
            }
        }

        batch.setTotalCount(allBalances.size());
        batch.setSuccessCount(successCount);
        batch.setFailCount(failCount);
        batch.setStatus(failCount == 0 ? "COMPLETED" : "FAILED");
        batch.setCompletedAt(LocalDateTime.now());
        distributionBatchMapper.updateById(batch);

        log.info("积分补发完成: 补发人数={}, 成功={}, 失败={}", pendingUsers.size(),
                successCount - batch.getSuccessCount(), failCount - batch.getFailCount());
    }

    /**
     * 单用户发放（独立事务）
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void distributeToUser(Long userId, int amount, String remark) {
        PointBalancePO balance = pointBalanceMapper.selectOne(
                new LambdaQueryWrapper<PointBalancePO>()
                        .eq(PointBalancePO::getUserId, userId)
        );
        if (balance == null) {
            throw new RuntimeException("用户余额记录不存在: userId=" + userId);
        }

        int newBalance = balance.getBalance() + amount;
        balance.setBalance(newBalance);
        pointBalanceMapper.updateById(balance);

        PointTransactionPO tx = new PointTransactionPO();
        tx.setUserId(userId);
        tx.setType(TransactionType.DISTRIBUTION);
        tx.setAmount(amount);
        tx.setBalanceAfter(newBalance);
        tx.setRemark(remark);
        pointTransactionMapper.insert(tx);
    }
}
