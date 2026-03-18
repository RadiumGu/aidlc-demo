package com.awsome.shop.point.domain.model.points;

/**
 * 积分流水类型枚举
 */
public enum PointsTransactionType {

    /** 获得积分 */
    EARN,

    /** 消费积分 */
    SPEND,

    /** 管理员发放 */
    ADMIN_ADD,

    /** 管理员扣除 */
    ADMIN_DEDUCT
}
