package com.awsome.shop.points.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("distribution_batches")
public class DistributionBatchPO {

    @TableId(type = IdType.AUTO)
    private Long id;
    private Integer distributionAmount;
    private Integer totalCount;
    private Integer successCount;
    private Integer failCount;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
}
