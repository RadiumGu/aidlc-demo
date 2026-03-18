package com.awsome.shop.auth.repository.mysql.impl.user;

import com.awsome.shop.auth.domain.model.user.UserEntity;
import com.awsome.shop.auth.domain.model.user.UserRole;
import com.awsome.shop.auth.domain.model.user.UserStatus;
import com.awsome.shop.auth.repository.mysql.mapper.user.UserMapper;
import com.awsome.shop.auth.repository.mysql.po.user.UserPO;
import com.awsome.shop.auth.repository.user.UserRepository;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

/**
 * 用户仓储实现
 */
@Repository
@RequiredArgsConstructor
public class UserRepositoryImpl implements UserRepository {

    private final UserMapper userMapper;

    @Override
    public UserEntity findByUsername(String username) {
        UserPO po = userMapper.selectOne(
                new LambdaQueryWrapper<UserPO>().eq(UserPO::getUsername, username));
        return po == null ? null : toEntity(po);
    }

    @Override
    public UserEntity findById(Long id) {
        UserPO po = userMapper.selectById(id);
        return po == null ? null : toEntity(po);
    }

    @Override
    public void save(UserEntity entity) {
        UserPO po = toPO(entity);
        userMapper.insert(po);
        entity.setId(po.getId());
    }

    @Override
    public void updateFailedAttempts(Long id, Integer failedAttempts, LocalDateTime lockedUntil) {
        userMapper.update(null,
                new LambdaUpdateWrapper<UserPO>()
                        .eq(UserPO::getId, id)
                        .set(UserPO::getFailedAttempts, failedAttempts)
                        .set(UserPO::getLockedUntil, lockedUntil));
    }

    private UserEntity toEntity(UserPO po) {
        UserEntity entity = new UserEntity();
        entity.setId(po.getId());
        entity.setUsername(po.getUsername());
        entity.setPasswordHash(po.getPasswordHash());
        entity.setDisplayName(po.getDisplayName());
        entity.setRole(UserRole.valueOf(po.getRole()));
        entity.setAvatar(po.getAvatar());
        entity.setStatus(UserStatus.valueOf(po.getStatus()));
        entity.setFailedAttempts(po.getFailedAttempts());
        entity.setLockedUntil(po.getLockedUntil());
        entity.setCreatedAt(po.getCreatedAt());
        entity.setUpdatedAt(po.getUpdatedAt());
        return entity;
    }

    private UserPO toPO(UserEntity entity) {
        UserPO po = new UserPO();
        po.setId(entity.getId());
        po.setUsername(entity.getUsername());
        po.setPasswordHash(entity.getPasswordHash());
        po.setDisplayName(entity.getDisplayName());
        po.setRole(entity.getRole() != null ? entity.getRole().name() : null);
        po.setAvatar(entity.getAvatar());
        po.setStatus(entity.getStatus() != null ? entity.getStatus().name() : null);
        po.setFailedAttempts(entity.getFailedAttempts());
        po.setLockedUntil(entity.getLockedUntil());
        return po;
    }
}
