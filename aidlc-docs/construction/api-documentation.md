# AWSomeShop API 接口文档

## 概述
- **网关地址**: http://localhost:8080
- **认证方式**: Bearer Token（JWT）
- **响应格式**: `{ "code": "SUCCESS", "message": "操作成功", "data": {...} }`
- **错误响应**: `{ "code": "ERROR_CODE", "message": "错误描述", "data": null }`

---

## 1. Auth Service (端口 8001)

### 1.1 登录
- **POST** `/api/v1/public/auth/login` ⬜ 公开
- **请求**: `{ "username": "admin", "password": "admin123" }`
- **响应 data**: `{ "accessToken": "jwt...", "refreshToken": "jwt...", "expiresIn": 7200, "user": { "userId": 1, "username": "admin", "displayName": "管理员", "role": "ADMIN" } }`

### 1.2 登出
- **POST** `/api/v1/auth/logout` 🔒 需认证
- **请求头**: `Authorization: Bearer {accessToken}`
- **响应 data**: null

### 1.3 刷新 Token
- **POST** `/api/v1/public/auth/refresh` ⬜ 公开
- **请求**: `{ "refreshToken": "jwt..." }`
- **响应 data**: 同登录响应

### 1.4 获取当前用户
- **GET** `/api/v1/auth/me` 🔒 需认证
- **请求头**: `Authorization: Bearer {accessToken}`
- **响应 data**: `{ "userId": 1, "username": "admin", "displayName": "管理员", "role": "ADMIN", "avatar": null }`

### 1.5 内部 Token 验证（服务间调用）
- **POST** `/api/v1/internal/auth/validate` 🔐 内部
- **请求**: `{ "token": "jwt..." }`
- **响应 data**: `{ "valid": true, "userId": 1, "username": "admin", "role": "ADMIN" }`

---

## 2. Product Service (端口 8002)

### 2.1 商品列表
- **POST** `/api/v1/public/product/list` ⬜ 公开
- **请求**: `{ "pageNum": 1, "pageSize": 10, "keyword": "耳机", "category": "digital" }`
- **响应 data**: `{ "records": [...], "total": 100, "pageNum": 1, "pageSize": 10 }`

### 2.2 商品详情
- **GET** `/api/v1/public/product/{id}` ⬜ 公开
- **响应 data**: `{ "id": 1, "name": "...", "description": "...", "category": "...", "pointsCost": 2580, "stock": 100, "image": "...", "status": "ON_SALE" }`

### 2.3 创建商品
- **POST** `/api/v1/admin/product/create` 🔑 管理员
- **请求**: `{ "name": "...", "description": "...", "category": "...", "pointsCost": 2580, "stock": 100, "image": "..." }`

### 2.4 编辑商品
- **POST** `/api/v1/admin/product/update` 🔑 管理员
- **请求**: `{ "id": 1, "name": "...", "description": "...", ... }`

### 2.5 上下架
- **POST** `/api/v1/admin/product/status` 🔑 管理员
- **请求**: `{ "id": 1, "status": "ON_SALE" | "OFF_SALE" }`

### 2.6 库存扣减（内部）
- **POST** `/api/v1/internal/product/deduct-stock` 🔐 内部
- **请求**: `{ "productId": 1, "quantity": 1 }`
- **说明**: 乐观锁，stock < quantity 返回错误

### 2.7 库存恢复（内部）
- **POST** `/api/v1/internal/product/restore-stock` 🔐 内部
- **请求**: `{ "productId": 1, "quantity": 1 }`

---

## 3. Points Service (端口 8003)

### 3.1 查询余额
- **GET** `/api/v1/points/balance` 🔒 需认证
- **请求头**: `X-Operator-Id: {employeeId}`（网关注入）
- **响应 data**: `{ "employeeId": 1, "balance": 2580, "totalEarned": 5000, "totalSpent": 2420 }`

### 3.2 积分流水
- **POST** `/api/v1/points/transactions` 🔒 需认证
- **请求**: `{ "pageNum": 1, "pageSize": 10 }`
- **响应 data**: `{ "records": [{ "id": 1, "type": "EARN", "amount": 500, "balanceAfter": 2580, "remark": "...", "createdAt": "..." }], "total": 50 }`

### 3.3 管理员发放积分
- **POST** `/api/v1/admin/points/add` 🔑 管理员
- **请求**: `{ "employeeId": 2, "amount": 500, "remark": "绩效奖励" }`

### 3.4 管理员扣除积分
- **POST** `/api/v1/admin/points/deduct` 🔑 管理员
- **请求**: `{ "employeeId": 2, "amount": 100, "remark": "调整" }`

### 3.5 兑换扣减（内部）
- **POST** `/api/v1/internal/points/deduct` 🔐 内部
- **请求**: `{ "employeeId": 2, "amount": 2580, "orderId": 1 }`
- **说明**: 乐观锁，余额不足返回错误

### 3.6 取消退还（内部）
- **POST** `/api/v1/internal/points/refund` 🔐 内部
- **请求**: `{ "employeeId": 2, "amount": 2580, "orderId": 1 }`

---

## 4. Order Service (端口 8004)

### 4.1 创建兑换订单
- **POST** `/api/v1/order/create` 🔒 需认证
- **请求**: `{ "productId": 1, "quantity": 1 }`
- **请求头**: `X-Operator-Id: {employeeId}`（网关注入）
- **Saga 流程**: 查商品 → 扣积分 → 扣库存 → (失败退积分) → 创建订单
- **响应 data**: `{ "id": 1, "orderNo": "ORD20260318170000xxxx", "productName": "...", "totalPoints": 2580, "status": "PENDING" }`

### 4.2 我的订单列表
- **POST** `/api/v1/order/list` 🔒 需认证
- **请求**: `{ "pageNum": 1, "pageSize": 10, "status": "PENDING" }`

### 4.3 订单详情
- **GET** `/api/v1/order/{id}` 🔒 需认证

### 4.4 取消订单
- **POST** `/api/v1/order/cancel` 🔒 需认证
- **请求**: `{ "orderId": 1, "reason": "不需要了" }`
- **补偿**: 退还积分 + 恢复库存

### 4.5 管理员订单列表
- **POST** `/api/v1/admin/order/list` 🔑 管理员
- **请求**: `{ "pageNum": 1, "pageSize": 10, "status": "TO_SHIP" }`

### 4.6 发货
- **POST** `/api/v1/admin/order/ship` 🔑 管理员
- **请求**: `{ "orderId": 1 }`

### 4.7 确认完成
- **POST** `/api/v1/admin/order/complete` 🔑 管理员
- **请求**: `{ "orderId": 1 }`

---

## 5. Gateway Service (端口 8080)

### 路由规则
| 路径模式 | 目标服务 | 认证 |
|---------|---------|------|
| `/api/v1/public/auth/**` | Auth (8001) | ⬜ 不需要 |
| `/api/v1/public/product/**` | Product (8002) | ⬜ 不需要 |
| `/api/v1/auth/**` | Auth (8001) | 🔒 需认证 |
| `/api/v1/points/**` | Points (8003) | 🔒 需认证 |
| `/api/v1/order/**` | Order (8004) | 🔒 需认证 |
| `/api/v1/admin/product/**` | Product (8002) | 🔑 ADMIN |
| `/api/v1/admin/points/**` | Points (8003) | 🔑 ADMIN |
| `/api/v1/admin/order/**` | Order (8004) | 🔑 ADMIN |
| `/api/v1/internal/**` | ❌ 拒绝 | 🚫 外部不可访问 |

### 过滤器链
1. **AccessLogFilter** (HIGHEST) — 请求日志 + requestId
2. **AuthenticationFilter** (100) — JWT 验证 + 拦截 internal 路径
3. **RoleAuthorizationFilter** (150) — admin 路径 ADMIN 角色校验
4. **OperatorIdInjectionFilter** (200) — 注入 X-Operator-Id 到请求头

### 注入的请求头
- `X-Operator-Id`: 用户 ID
- `X-Username`: 用户名
- `X-Role`: 角色 (ADMIN/EMPLOYEE)

---

## 图例
- ⬜ 公开接口（不需要认证）
- 🔒 需认证（Bearer Token）
- 🔑 管理员（需 ADMIN 角色）
- 🔐 内部接口（仅服务间调用，Gateway 拦截外部访问）
