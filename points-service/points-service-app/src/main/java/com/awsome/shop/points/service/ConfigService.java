package com.awsome.shop.points.service;

import com.awsome.shop.points.dto.DistributionConfigResponse;
import com.awsome.shop.points.dto.UpdateDistributionConfigRequest;
import com.awsome.shop.points.model.SystemConfigPO;
import com.awsome.shop.points.repository.SystemConfigMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ConfigService {

    private static final String DISTRIBUTION_AMOUNT_KEY = "points.distribution.amount";
    private static final int DEFAULT_DISTRIBUTION_AMOUNT = 100;

    private final SystemConfigMapper systemConfigMapper;

    /**
     * 获取发放配置
     */
    public DistributionConfigResponse getDistributionConfig() {
        SystemConfigPO config = getConfigByKey(DISTRIBUTION_AMOUNT_KEY);
        DistributionConfigResponse response = new DistributionConfigResponse();
        if (config != null) {
            response.setAmount(Integer.parseInt(config.getConfigValue()));
            response.setUpdatedAt(config.getUpdatedAt());
        } else {
            response.setAmount(DEFAULT_DISTRIBUTION_AMOUNT);
            response.setUpdatedAt(null);
        }
        return response;
    }

    /**
     * 更新发放配置（UPSERT）
     */
    public DistributionConfigResponse updateDistributionConfig(UpdateDistributionConfigRequest request) {
        SystemConfigPO config = getConfigByKey(DISTRIBUTION_AMOUNT_KEY);
        if (config != null) {
            config.setConfigValue(String.valueOf(request.getAmount()));
            config.setDescription("每月自动发放积分额度");
            systemConfigMapper.updateById(config);
        } else {
            config = new SystemConfigPO();
            config.setConfigKey(DISTRIBUTION_AMOUNT_KEY);
            config.setConfigValue(String.valueOf(request.getAmount()));
            config.setDescription("每月自动发放积分额度");
            systemConfigMapper.insert(config);
        }

        DistributionConfigResponse response = new DistributionConfigResponse();
        response.setAmount(request.getAmount());
        response.setUpdatedAt(config.getUpdatedAt());
        return response;
    }

    /**
     * 获取发放额度（内部方法，供 DistributionService 调用）
     */
    public int getDistributionAmount() {
        SystemConfigPO config = getConfigByKey(DISTRIBUTION_AMOUNT_KEY);
        if (config != null) {
            return Integer.parseInt(config.getConfigValue());
        }
        return DEFAULT_DISTRIBUTION_AMOUNT;
    }

    private SystemConfigPO getConfigByKey(String key) {
        return systemConfigMapper.selectOne(
                new LambdaQueryWrapper<SystemConfigPO>()
                        .eq(SystemConfigPO::getConfigKey, key)
        );
    }
}
