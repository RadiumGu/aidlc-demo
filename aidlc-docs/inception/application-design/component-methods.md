# 组件方法定义

> 注：此处定义方法签名和高层用途。详细业务规则在 CONSTRUCTION 阶段的 Functional Design 中定义。

---

## Auth Service

### Interface Layer（REST API）

| 方法 | 路径 | 说明 |
|------|------|------|
| `login(LoginRequest)` | POST `/api/v1/public/auth/login` | 用户登录，返回 JWT Token + 用户信息 |
| `logout(LogoutRequest)` | POST `/api/v1/auth/logout` | 退出登录，Token 失效 |
| `validateToken(ValidateRequest)` | POST `/api/v1/internal/auth/validate` | 内部接口，Gateway 调用验证 Token |
| `refreshToken(RefreshRequest)` | POST `/api/v1/auth/refresh` | 刷新 Token |
| `getCurrentUser()` | GET `/api/v1/auth/me` | 获取当前用户信息 |

### Application Layer

| 方法 | 输入 | 输出 | 说明 |
|------|------|------|------|
| `login(username, password)` | String, String | AuthResponse(token, user) | 验证凭证，签发 Token |
| `logout(token)` | String | void | 将 Token 加入黑名单 |
| `validateToken(token)` | String | AuthValidateResponse | 验证 Token 有效性，返回 operatorId 和角色 |
| `refreshToken(refreshToken)` | String | AuthResponse | 刷新 Token |
| `getCurrentUser(operatorId)` | String | UserDTO | 获取用户信息 |

### Domain Layer

| 方法 | 说明 |
|------|------|
| `UserEntity.authenticate(password)` | 验证密码 |
| `UserEntity.incrementFailedAttempts()` | 增加失败次数 |
| `UserEntity.isLocked()` | 检查是否锁定 |
| `JwtTokenService.generate(user)` | 生成 JWT |
| `JwtTokenService.validate(token)` | 验证 JWT |
| `JwtTokenService.invalidate(token)` | 使 Token 失效 |

### 数据模型

**UserEntity**: id, username, passwordHash, displayName, role(admin/employee), avatar, status, failedAttempts, lockedUntil, createdAt, updatedAt

---

## Product Service

### Interface Layer（REST API）

| 方法 | 路径 | 说明 |
|------|------|------|
| `create(CreateProductRequest)` | POST `/api/v1/admin/product/create` | 管理员创建商品 |
| `update(UpdateProductRequest)` | POST `/api/v1/admin/product/update` | 管理员编辑商品 |
| `updateStatus(UpdateStatusRequest)` | POST `/api/v1/admin/product/status` | 管理员上下架 |
| `list(ListProductRequest)` | POST `/api/v1/public/product/list` | 商品列表（分页+筛选+搜索） |
| `detail(Long id)` | GET `/api/v1/public/product/{id}` | 商品详情 |
| `deductStock(DeductStockRequest)` | POST `/api/v1/internal/product/deduct-stock` | 内部接口，扣减库存 |
| `restoreStock(RestoreStockRequest)` | POST `/api/v1/internal/product/restore-stock` | 内部接口，恢复库存 |

### Application Layer

| 方法 | 说明 |
|------|------|
| `create(request)` → ProductDTO | 创建商品 |
| `update(request)` → ProductDTO | 更新商品信息 |
| `updateStatus(id, status)` → void | 上下架 |
| `list(request)` → PageResult<ProductDTO> | 列表查询（分页+筛选+搜索） |
| `detail(id)` → ProductDTO | 商品详情 |
| `deductStock(productId, quantity)` → boolean | 库存扣减（乐观锁） |
| `restoreStock(productId, quantity)` → void | 库存恢复 |

---

## Points Service

### Interface Layer（REST API）

| 方法 | 路径 | 说明 |
|------|------|------|
| `getBalance(employeeId)` | GET `/api/v1/points/balance` | 查询积分余额 |
| `getTransactions(request)` | POST `/api/v1/points/transactions` | 积分流水列表 |
| `adminAdd(AddPointsRequest)` | POST `/api/v1/admin/points/add` | 管理员发放积分 |
| `adminDeduct(DeductPointsRequest)` | POST `/api/v1/admin/points/deduct` | 管理员扣除积分 |
| `deductForOrder(OrderDeductRequest)` | POST `/api/v1/internal/points/deduct` | 内部接口，兑换扣减 |
| `refundForOrder(OrderRefundRequest)` | POST `/api/v1/internal/points/refund` | 内部接口，取消退还 |

### Application Layer

| 方法 | 说明 |
|------|------|
| `getBalance(employeeId)` → PointsBalanceDTO | 查询余额 |
| `getTransactions(employeeId, page)` → PageResult<PointsTransactionDTO> | 流水查询 |
| `adminAdd(employeeId, amount, remark, operatorId)` → void | 发放积分 |
| `adminDeduct(employeeId, amount, remark, operatorId)` → void | 扣除积分 |
| `deductForOrder(employeeId, amount, orderId)` → boolean | 兑换扣减 |
| `refundForOrder(employeeId, amount, orderId)` → void | 取消退还 |

### 数据模型

**PointsAccountEntity**: id, employeeId, balance, totalEarned, totalSpent, createdAt, updatedAt
**PointsTransactionEntity**: id, employeeId, type(EARN/SPEND/ADMIN_ADD/ADMIN_DEDUCT), amount, balanceAfter, orderId(nullable), operatorId, remark, createdAt

---

## Order Service

### Interface Layer（REST API）

| 方法 | 路径 | 说明 |
|------|------|------|
| `create(CreateOrderRequest)` | POST `/api/v1/order/create` | 员工兑换下单 |
| `myOrders(request)` | POST `/api/v1/order/my-orders` | 我的订单列表 |
| `detail(orderId)` | GET `/api/v1/order/{id}` | 订单详情 |
| `cancel(orderId)` | POST `/api/v1/order/cancel` | 取消订单 |
| `adminList(request)` | POST `/api/v1/admin/order/list` | 管理员查看全部订单 |
| `adminUpdateStatus(request)` | POST `/api/v1/admin/order/status` | 管理员更新状态 |

### Application Layer

| 方法 | 说明 |
|------|------|
| `create(employeeId, productId, quantity)` → OrderDTO | 创建订单（协调事务：扣积分+扣库存+创建订单） |
| `myOrders(employeeId, page)` → PageResult<OrderDTO> | 我的订单 |
| `detail(orderId)` → OrderDTO | 订单详情 |
| `cancel(orderId, operatorId)` → void | 取消订单（退积分+恢复库存） |
| `adminList(request)` → PageResult<OrderDTO> | 全部订单 |
| `adminUpdateStatus(orderId, newStatus)` → void | 更新状态 |

### 数据模型

**OrderEntity**: id, orderNo, employeeId, totalPoints, status(PENDING/CONFIRMED/SHIPPED/COMPLETED/CANCELLED), remark, createdAt, updatedAt
**OrderItemEntity**: id, orderId, productId, productName, productImage, pointsPrice, quantity, subtotalPoints

---

## Gateway Service（增量）

### 新增能力

| 功能 | 说明 |
|------|------|
| 角色权限过滤器 | 新增 RoleAuthorizationFilter，对 `/api/v1/admin/**` 路径校验 admin 角色 |
| 路由扩展 | 新增 auth/points/order 的路由规则 |
| Token 验证增强 | AuthValidateResponse 增加 role 字段 |
