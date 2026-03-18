# API 文档

## REST APIs

### Gateway Service（端口 8080）

网关服务本身不暴露业务 API，负责路由转发和认证。

**路由规则**（application-local.yml）:
| 路由ID | 目标服务 | 路径匹配 |
|--------|---------|---------|
| auth-* | Auth Service (:8001) | `/api/v1/**/auth/**` |
| product-* | Product Service (:8002) | `/api/v1/**/product/**` |
| point-* | Points Service (:8003) | `/api/v1/**/point/**` |
| order-* | Order Service (:8004) | `/api/v1/**/order/**` |

**公开路径**（免认证）:
- `/api/v1/public/**` — 公开 API
- `/v3/api-docs/**` — Swagger 文档
- `/swagger-ui/**` — Swagger UI
- `/actuator/**` — 监控端点

**认证头注入**:
- 输入: `Authorization: Bearer <jwt-token>`
- 输出: `X-Operator-Id: <user-id>`（注入到下游请求头）

### Auth Service（端口 8001）

| 方法 | 路径 | 说明 | 状态 |
|------|------|------|------|
| POST | `/api/v1/internal/auth/validate` | 内部 Token 验证接口 | 被 Gateway 调用 |
| — | 登录/注册等 | 用户认证相关 | 待实现 |

### Product Service（端口 8002）

| 方法 | 路径 | 说明 | 状态 |
|------|------|------|------|
| POST | `/api/v1/public/product/create` | 创建商品 | 已实现 |
| POST | `/api/v1/public/product/list` | 商品列表查询（分页） | 已实现 |

**CreateProductRequest 字段**:
- name, sku, category, brand, pointsPrice, marketPrice, stock, status
- description, imageUrl, subtitle, deliveryMethod, serviceGuarantee
- promotion, colors, specs

**ProductDTO 返回字段**: 同上 + id, soldCount, createdAt, updatedAt

### Points Service（端口 8003）

| 方法 | 路径 | 说明 | 状态 |
|------|------|------|------|
| — | — | 积分相关 API | 全部待实现 |

### Order Service（端口 8004）

| 方法 | 路径 | 说明 | 状态 |
|------|------|------|------|
| — | — | 订单相关 API | 全部待实现 |

## 内部接口

### Gateway 认证接口

```java
// AuthenticationService（响应式接口）
Mono<AuthenticationResult> validate(String token)
```

### 各服务通用接口模式

```java
// Application Service（应用层接口）
interface XxxApplicationService {
    PageResult<XxxDTO> list(ListXxxRequest request);
    XxxDTO create(CreateXxxRequest request);
    XxxDTO get(GetXxxRequest request);
    void update(UpdateXxxRequest request);
    void delete(DeleteXxxRequest request);
}

// Domain Service（领域层接口）
interface XxxDomainService { ... }

// Repository（仓储接口）
interface XxxRepository { ... }
```

## 数据模型

### ProductEntity（商品实体 — 已定义）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 主键 |
| name | String | 商品名称 |
| sku | String | SKU 编号 |
| category | String | 分类 |
| brand | String | 品牌 |
| pointsPrice | Integer | 积分价格 |
| marketPrice | BigDecimal | 市场价 |
| stock | Integer | 库存 |
| soldCount | Integer | 已售数量 |
| status | Integer | 状态 |
| description | String | 描述 |
| imageUrl | String | 图片URL |
| subtitle | String | 副标题 |
| deliveryMethod | String | 配送方式 |
| serviceGuarantee | String | 服务保障 |
| promotion | String | 促销信息 |
| colors | String | 颜色选项 |
| specs | List<Map<String,String>> | 规格参数 |
| createdAt | LocalDateTime | 创建时间 |
| updatedAt | LocalDateTime | 更新时间 |

### TestEntity（各服务占位实体）
- 仅包含 id, name 字段，用于脚手架验证

### 待实现的领域模型
- **UserEntity** — 用户/员工实体（Auth Service）
- **PointsAccountEntity** — 积分账户实体（Points Service）
- **PointsTransactionEntity** — 积分流水实体（Points Service）
- **OrderEntity** — 订单实体（Order Service）
- **OrderItemEntity** — 订单明细实体（Order Service）
