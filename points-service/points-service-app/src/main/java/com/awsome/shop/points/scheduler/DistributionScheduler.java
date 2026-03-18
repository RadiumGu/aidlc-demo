package com.awsome.shop.points.scheduler;

import com.awsome.shop.points.service.DistributionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 积分自动发放定时任务
 * 每月1日凌晨2:00执行
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DistributionScheduler {

    private final DistributionService distributionService;

    @Scheduled(cron = "0 0 2 1 * ?")
    public void execute() {
        log.info("===== 积分自动发放任务开始 =====");
        try {
            distributionService.executeDistribution();
        } catch (Exception e) {
            log.error("积分自动发放任务异常: {}", e.getMessage(), e);
        }
        log.info("===== 积分自动发放任务结束 =====");
    }
}
