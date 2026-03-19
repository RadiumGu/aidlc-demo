package com.awsome.shop.auth.repository.mysql.impl;

import com.awsome.shop.auth.common.dto.PageResult;
import com.awsome.shop.auth.domain.model.User;
import com.awsome.shop.auth.domain.model.enums.Role;
import com.awsome.shop.auth.domain.model.enums.UserStatus;
import com.awsome.shop.auth.domain.repository.UserRepository;
import com.awsome.shop.auth.repository.mysql.mapper.UserMapper;
import com.awsome.shop.auth.repository.mysql.po.UserPO;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class UserRepositoryImpl implements UserRepository {

    private final UserMapper userMapper;

    @Override
    public User findById(Long id) {
        UserPO po = userMapper.selectById(id);
        return po == null ? null : toUser(po);
    }

    @Override
    public User findByUsername(String username) {
        LambdaQueryWrapper<UserPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserPO::getUsername, username);
        UserPO po = userMapper.selectOne(wrapper);
        return po == null ? null : toUser(po);
    }

    @Override
    public User findByEmployeeId(String employeeId) {
        LambdaQueryWrapper<UserPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserPO::getEmployeeId, employeeId);
        UserPO po = userMapper.selectOne(wrapper);
        return po == null ? null : toUser(po);
    }

    @Override
    public User save(User user) {
        UserPO po = toPO(user);
        userMapper.insert(po);
        user.setId(po.getId());
        return user;
    }

    @Override
    public void update(User user) {
        UserPO po = toPO(user);
        userMapper.updateById(po);
    }

    @Override
    public PageResult<User> findPage(int page, int size, String keyword) {
        LambdaQueryWrapper<UserPO> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w
                    .like(UserPO::getUsername, keyword)
                    .or().like(UserPO::getName, keyword)
                    .or().like(UserPO::getEmployeeId, keyword));
        }
        wrapper.orderByDesc(UserPO::getCreatedAt);

        IPage<UserPO> result = userMapper.selectPage(new Page<>(page + 1, size), wrapper);

        PageResult<User> pageResult = new PageResult<>();
        pageResult.setCurrent(result.getCurrent());
        pageResult.setSize(result.getSize());
        pageResult.setTotal(result.getTotal());
        pageResult.setPages(result.getPages());
        pageResult.setRecords(result.getRecords().stream().map(this::toUser).collect(Collectors.toList()));
        return pageResult;
    }

    @Override
    public long countAll() {
        return userMapper.selectCount(null);
    }

    @Override
    public long countCreatedSince(java.time.LocalDateTime since) {
        return userMapper.selectCount(
                new LambdaQueryWrapper<UserPO>().ge(UserPO::getCreatedAt, since));
    }

    private User toUser(UserPO po) {
        return User.builder()
                .id(po.getId())
                .username(po.getUsername())
                .password(po.getPassword())
                .name(po.getName())
                .employeeId(po.getEmployeeId())
                .role(Role.valueOf(po.getRole()))
                .status(UserStatus.valueOf(po.getStatus()))
                .createdAt(po.getCreatedAt())
                .updatedAt(po.getUpdatedAt())
                .build();
    }

    private UserPO toPO(User user) {
        UserPO po = new UserPO();
        po.setId(user.getId());
        po.setUsername(user.getUsername());
        po.setPassword(user.getPassword());
        po.setName(user.getName());
        po.setEmployeeId(user.getEmployeeId());
        po.setRole(user.getRole() != null ? user.getRole().name() : null);
        po.setStatus(user.getStatus() != null ? user.getStatus().name() : null);
        return po;
    }
}
