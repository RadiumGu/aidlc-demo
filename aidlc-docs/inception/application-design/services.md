# 服务定义与编排

---

## 服务交互模式

### 同步 HTTP 调用
所有跨服务通信通过 HTTP REST API（经 Gateway 或直接内部调用）。

### 事务协调
兑换订单创建涉及跨服务事务，采用 **编排式 Saga（Orchestration Saga）** 模式，由 Order Service 作为协调者。

---

## 核心业务编排

### 编排 1: 积分兑换下单（Order Service 协调）

```
员工请求兑换
    |
    v
Order Service: 创建订单（status=PENDING）
    |
    v
Order Service -> Points Service: deductForOrder(积分扣减)
    |
    +-- 失败 --> 订单标记失败，返回错误
    |
    v (成功)
Order Service -> Product Service: deductStock(库存扣减)
    |
    +-- 失败 --> Points Service: refundForOrder(退还积分)
    |            订单标记失败，返回错误
    |
    v (成功)
Order Service: 更新订单 status=PENDING（等待管理员确认）
    |
    v
返回订单信息
```

**补偿机制**:
- 库存扣减失败 → 自动退还积分
- 全部成功 → 订单创建完成

### 编排 2: 订单取消（Order Service 协调）

```
取消请求
    |
    v
Order Service: 校验订单状态（仅 PENDING/CONFIRMED 可取消）
    |
    v
Order Service -> Points Service: refundForOrder(退还积分)
    |
    v
Order Service -> Product Service: restoreStock(恢复库存)
    |
    v
Order Service: 更新订单 status=CANCELLED
```

### 编排 3: 认证流程（Gateway + Auth Service）

```
请求到达 Gateway
    |
    v
AuthenticationGatewayFilter: 提取 Authorization 头
    |
    v
Gateway -> Auth Service: validateToken(token)
    |
    +-- 失败 --> 返回 401
    |
    v (成功，返回 operatorId + role)
RoleAuthorizationFilter: 校验 /admin/** 路径需 admin 角色
    |
    +-- 角色不匹配 --> 返回 403
    |
    v (通过)
注入 X-Operator-Id + X-Operator-Role 头
    |
    v
转发到后端服务
```

---

## 服务职责边界

| 服务 | 拥有的数据 | 提供的内部接口 | 调用的外部服务 |
|------|-----------|--------------|--------------|
| Auth | 用户表 | validateToken, getCurrentUser | 无 |
| Product | 商品表 | deductStock, restoreStock | 无 |
| Points | 积分账户表, 积分流水表 | deductForOrder, refundForOrder | 无 |
| Order | 订单表, 订单明细表 | 无 | Points(扣减/退还), Product(扣减/恢复) |
| Gateway | 无自有数据 | 无 | Auth(Token验证) |

---

## 内部接口通信

| 调用方 | 被调用方 | 接口 | 协议 | 说明 |
|--------|---------|------|------|------|
| Gateway | Auth | `/api/v1/internal/auth/validate` | HTTP POST | Token 验证 |
| Order | Points | `/api/v1/internal/points/deduct` | HTTP POST | 兑换扣积分 |
| Order | Points | `/api/v1/internal/points/refund` | HTTP POST | 取消退积分 |
| Order | Product | `/api/v1/internal/product/deduct-stock` | HTTP POST | 扣库存 |
| Order | Product | `/api/v1/internal/product/restore-stock` | HTTP POST | 恢复库存 |

> 内部接口（`/internal/`）路径在 Gateway 不暴露，仅服务间直接调用。
