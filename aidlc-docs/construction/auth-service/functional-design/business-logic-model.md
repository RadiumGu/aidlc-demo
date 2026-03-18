# Auth Service — 业务逻辑模型

## 核心业务流程

### 流程 1: 用户登录

```
输入: username, password
    |
    v
查找用户(username)
    |
    +-- 用户不存在 --> 抛出 "用户名或密码错误"
    |
    v
检查用户状态
    |
    +-- 账号锁定且未过期 --> 抛出 "账号已锁定，请X分钟后重试"
    |
    v
验证密码(BCrypt.matches)
    |
    +-- 密码错误 --> 增加失败次数
    |                  +-- 达到上限(5次) --> 锁定账号30分钟
    |                  返回 "用户名或密码错误"
    |
    v (密码正确)
重置失败次数
    |
    v
生成 JWT Token (含 userId, username, role)
生成 Refresh Token
    |
    v
返回: { token, refreshToken, user: {id, username, displayName, role, avatar} }
```

### 流程 2: Token 验证（内部接口）

```
输入: token (JWT字符串)
    |
    v
解析 JWT Token
    |
    +-- 解析失败/过期/签名错误 --> 返回 { success: false, message: "..." }
    |
    v
检查 Token 是否在黑名单(Redis)
    |
    +-- 在黑名单 --> 返回 { success: false, message: "Token已失效" }
    |
    v
提取 claims: userId, username, role
    |
    v
返回: { success: true, operatorId: userId, role: role }
```

### 流程 3: 退出登录

```
输入: token
    |
    v
解析 Token 获取过期时间
    |
    v
将 Token 加入 Redis 黑名单，TTL = Token剩余有效时间
    |
    v
返回成功
```

### 流程 4: 刷新 Token

```
输入: refreshToken
    |
    v
验证 Refresh Token 有效性
    |
    +-- 无效/过期 --> 抛出 "请重新登录"
    |
    v
将旧 Token 加入黑名单
生成新 JWT Token + 新 Refresh Token
    |
    v
返回: { token, refreshToken }
```

### 流程 5: 获取当前用户

```
输入: operatorId (从请求头 X-Operator-Id 获取)
    |
    v
查询用户(id = operatorId)
    |
    +-- 不存在 --> 抛出 404
    |
    v
返回: { id, username, displayName, role, avatar, createdAt }
```
