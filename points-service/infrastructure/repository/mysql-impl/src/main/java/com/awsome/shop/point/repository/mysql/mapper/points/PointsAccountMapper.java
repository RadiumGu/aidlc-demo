package com.awsome.shop.point.repository.mysql.mapper.points;

import com.awsome.shop.point.repository.mysql.po.points.PointsAccountPO;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

/**
 * 积分账户 Mapper
 */
@Mapper
public interface PointsAccountMapper extends BaseMapper<PointsAccountPO> {

    /**
     * 乐观锁扣减余额（余额必须 >= amount）
     *
     * @return 影响行数（1=成功, 0=余额不足）
     */
    @Update("UPDATE t_points_account SET balance = balance - #{amount}, total_spent = total_spent + #{amount}, updated_at = NOW() WHERE employee_id = #{employeeId} AND balance >= #{amount}")
    int deductBalance(@Param("employeeId") Long employeeId, @Param("amount") Long amount);

    /**
     * 增加余额
     */
    @Update("UPDATE t_points_account SET balance = balance + #{amount}, total_earned = total_earned + #{amount}, updated_at = NOW() WHERE employee_id = #{employeeId}")
    int addBalance(@Param("employeeId") Long employeeId, @Param("amount") Long amount);
}
