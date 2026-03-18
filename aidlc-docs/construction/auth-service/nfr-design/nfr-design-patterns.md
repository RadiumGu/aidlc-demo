# Auth Service — NFR 设计模式

## 安全模式

### 模式 1: JWT 无状态认证 + Redis 黑名单

```
登录 → 签发 JWT (Access + Refresh)
    |
请求 → Gateway 提取 Token → Auth 验证:
    1. JJWT 解析签名 + 过期检查
    2. Redis 黑名单检查: GET auth:blacklist:{tokenHash}
    3. 通过 → 返回 operatorId + role
    |
退出 → Redis SET auth:blacklist:{tokenHash} EX {remainingTTL}
```

**设计要点**:
- Token 存储 SHA-256 hash 到 Redis（而非原始 Token），节省存储
- blacklist key 格式: `auth:blacklist:{sha256(token)}`
- TTL 自动过期，无需清理任务

### 模式 2: 密码安全模式

```
注册/初始化 → BCryptPasswordEncoder.encode(rawPassword) → 存储 hash
登录验证 → BCryptPasswordEncoder.matches(rawPassword, storedHash) → boolean
```

**设计要点**:
- BCrypt 强度因子 10（encode 约 100ms，可接受）
- 不自实现加密，使用 Spring Security 的 BCryptPasswordEncoder

### 模式 3: 防暴力破解 — 数据库行级锁定

```
登录失败 → UPDATE t_user SET failed_attempts = failed_attempts + 1 WHERE id = ?
         → IF failed_attempts >= maxAttempts → SET locked_until = NOW() + lockDuration
登录检查 → SELECT ... WHERE username = ? → 检查 locked_until > NOW()
登录成功 → UPDATE t_user SET failed_attempts = 0, locked_until = NULL WHERE id = ?
```

**设计要点**:
- 使用数据库行锁保证并发安全（`UPDATE` 自带行锁）
- 不使用 Redis 计数（避免 Redis 故障导致安全漏洞）
- lockedUntil 时间到期后自动解锁（无需定时任务）

## 性能模式

### 模式 4: Token 验证快速路径

```
Token 验证（每个请求调用）:
    1. JJWT 本地解析（纯 CPU，无 IO）  → ~1ms
    2. Redis GET 黑名单检查             → ~2ms
    总计: ~3ms（远低于 100ms 要求）
```

**设计要点**:
- JWT 签名验证是本地计算，不需要查数据库
- 仅黑名单检查需要一次 Redis 读取
- 不缓存用户信息（Token 验证不需要查 DB）

## 可用性模式

### 模式 5: Redis 故障降级

```
Token 验证时:
    try {
        Redis GET blacklist check
    } catch (RedisException) {
        log.warn("Redis unavailable, skipping blacklist check")
        → 允许通过（降级：已退出 Token 短时间内仍有效）
    }
```

**设计要点**:
- Redis 不可用不应阻塞认证流程
- 降级影响有限：最多 2 小时内已退出 Token 仍有效
- 记录降级事件用于监控告警

## 可观测性模式

### 模式 6: 认证事件指标

```java
// Micrometer Counter
auth.login.success    — 登录成功计数（tag: role）
auth.login.failure    — 登录失败计数（tag: reason=bad_password/locked/disabled）
auth.token.validate   — Token 验证计数（tag: result=success/expired/blacklisted/invalid）
auth.token.validate.duration — Token 验证耗时（Timer）
```

### 模式 7: 审计日志

```
登录成功 → audit.log: {event: "LOGIN_SUCCESS", username, role, ip, timestamp}
登录失败 → audit.log: {event: "LOGIN_FAILURE", username, reason, ip, timestamp}
退出登录 → audit.log: {event: "LOGOUT", operatorId, timestamp}
```

- 审计日志独立文件（logback appender 分离）
- JSON 格式，便于日志平台检索
