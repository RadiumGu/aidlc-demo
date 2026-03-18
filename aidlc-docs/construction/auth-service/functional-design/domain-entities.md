# Auth Service — 领域实体

## UserEntity（用户实体）

### 属性

| 属性 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | Long | PK, 自增 | 用户ID |
| username | String | 非空, 唯一, 3-50字符 | 用户名 |
| passwordHash | String | 非空 | BCrypt 加密后的密码 |
| displayName | String | 非空, 2-50字符 | 显示名称 |
| role | String(Enum) | 非空, admin/employee | 用户角色 |
| avatar | String | 可空, URL | 头像地址 |
| status | Integer | 非空, 默认1 | 状态：1=正常, 0=禁用 |
| failedAttempts | Integer | 非空, 默认0 | 连续登录失败次数 |
| lockedUntil | LocalDateTime | 可空 | 锁定截止时间 |
| createdAt | LocalDateTime | 非空 | 创建时间 |
| updatedAt | LocalDateTime | 非空 | 更新时间 |

### 领域方法

| 方法 | 说明 |
|------|------|
| `authenticate(rawPassword)` → boolean | 验证密码（BCrypt.matches） |
| `isLocked()` → boolean | 检查是否锁定（lockedUntil != null && lockedUntil > now） |
| `isActive()` → boolean | 检查是否正常状态（status == 1） |
| `incrementFailedAttempts(maxAttempts, lockDurationMinutes)` | 增加失败次数，达到上限时设置锁定时间 |
| `resetFailedAttempts()` | 重置失败次数和锁定时间 |

### 数据库表：t_user

```sql
CREATE TABLE t_user (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(50)     NOT NULL UNIQUE,
    password_hash   VARCHAR(200)    NOT NULL,
    display_name    VARCHAR(50)     NOT NULL,
    role            VARCHAR(20)     NOT NULL DEFAULT 'employee',
    avatar          VARCHAR(500)    NULL,
    status          TINYINT         NOT NULL DEFAULT 1,
    failed_attempts INT             NOT NULL DEFAULT 0,
    locked_until    DATETIME        NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 初始数据（种子）

```sql
-- 管理员账号
INSERT INTO t_user (username, password_hash, display_name, role) 
VALUES ('admin', '$2a$10$...', '管理员', 'admin');

-- 测试员工账号
INSERT INTO t_user (username, password_hash, display_name, role, avatar) 
VALUES ('employee', '$2a$10$...', '李明', 'employee', NULL);
```

---

## DTO 定义

### LoginRequest
| 字段 | 类型 | 约束 |
|------|------|------|
| username | String | @NotBlank, @Size(3,50) |
| password | String | @NotBlank, @Size(6,100) |

### AuthResponse
| 字段 | 类型 | 说明 |
|------|------|------|
| token | String | JWT Access Token |
| refreshToken | String | JWT Refresh Token |
| user | UserDTO | 用户信息 |

### UserDTO
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 用户ID |
| username | String | 用户名 |
| displayName | String | 显示名 |
| role | String | 角色 |
| avatar | String | 头像 |

### AuthValidateRequest / AuthValidateResponse
| 字段 | 类型 | 说明 |
|------|------|------|
| token | String | 待验证 Token |
| → success | boolean | 验证结果 |
| → operatorId | String | 用户ID |
| → role | String | 用户角色 |
| → message | String | 失败原因 |
