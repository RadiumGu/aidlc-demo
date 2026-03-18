package com.awsome.shop.order.enums;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Set;

/**
 * 兑换订单状态枚举
 *
 * 状态流转:
 * PENDING → READY → COMPLETED
 *   │         │
 *   └─────────┴──→ CANCELLED
 */
@Getter
@AllArgsConstructor
public enum OrderStatus {

    PENDING("PENDING", "已兑换，等待自取"),
    READY("READY", "可自取"),
    COMPLETED("COMPLETED", "已完成"),
    CANCELLED("CANCELLED", "已取消");

    @EnumValue
    private final String value;
    private final String description;

    /** 合法的状态流转目标 */
    private static final Set<String> PENDING_TARGETS = Set.of("READY", "CANCELLED");
    private static final Set<String> READY_TARGETS = Set.of("COMPLETED", "CANCELLED");

    /**
     * 校验当前状态是否可以流转到目标状态
     */
    public boolean canTransitionTo(OrderStatus target) {
        return switch (this) {
            case PENDING -> PENDING_TARGETS.contains(target.getValue());
            case READY -> READY_TARGETS.contains(target.getValue());
            case COMPLETED, CANCELLED -> false; // 终态
        };
    }
}
