# Auth Service — 业务规则

## 密码规则

| 规则ID | 规则 | 描述 |
|--------|------|------|
| BR-AUTH-01 | 密码加密 | 密码使用 BCrypt 加密存储，强度因子 10 |
| BR-AUTH-02 | 密码校验 | 使用 BCrypt.matches() 验证，不可逆 |
| BR-AUTH-03 | 错误提示 | 登录失败统一返回"用户名或密码错误"，不区分用户名不存在/密码错误 |

## 登录安全规则

| 规则ID | 规则 | 描述 |
|--------|------|------|
| BR-AUTH-04 | 失败计数 | 每次密码错误，failedAttempts + 1 |
| BR-AUTH-05 | 账号锁定 | failedAttempts >= 5 时，锁定账号 30 分钟 |
| BR-AUTH-06 | 锁定恢复 | 锁定到期后自动解锁（检查 lockedUntil < now） |
| BR-AUTH-07 | 成功重置 | 登录成功后，failedAttempts 重置为 0，lockedUntil 清空 |

## JWT Token 规则

| 规则ID | 规则 | 描述 |
|--------|------|------|
| BR-AUTH-08 | Token 内容 | JWT payload 包含：sub(userId), username, role, iat, exp |
| BR-AUTH-09 | Token 有效期 | Access Token 有效期 2 小时 |
| BR-AUTH-10 | Refresh Token | Refresh Token 有效期 7 天 |
| BR-AUTH-11 | 签名算法 | HMAC-SHA256 |
| BR-AUTH-12 | Token 黑名单 | 退出登录的 Token 存入 Redis，key=`auth:blacklist:{token}`，TTL=剩余有效时间 |
| BR-AUTH-13 | Token 验证顺序 | 签名验证 → 过期检查 → 黑名单检查 |

## 用户状态规则

| 规则ID | 规则 | 描述 |
|--------|------|------|
| BR-AUTH-14 | 用户状态 | status: 1=正常, 0=禁用 |
| BR-AUTH-15 | 禁用用户 | status=0 的用户不可登录 |
| BR-AUTH-16 | 角色枚举 | role: admin / employee，不可变更（MVP） |

## 验证规则

| 规则ID | 字段 | 规则 |
|--------|------|------|
| VR-AUTH-01 | username | 非空，3-50 字符 |
| VR-AUTH-02 | password | 非空，6-100 字符 |
| VR-AUTH-03 | token | 非空，有效 JWT 格式 |
