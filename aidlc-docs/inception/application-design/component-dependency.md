# 组件依赖关系

## 依赖矩阵

| 组件 ↓ 依赖 → | Auth | Product | Points | Order | Gateway |
|----------------|------|---------|--------|-------|---------|
| **Frontend** | 登录 | 浏览/管理 | 查询/管理 | 兑换/查看 | 全部流量 |
| **Gateway** | Token验证 | — | — | — | — |
| **Auth** | — | — | — | — | — |
| **Product** | — | — | — | — | — |
| **Points** | — | — | — | — | — |
| **Order** | — | 库存扣减/恢复 | 积分扣减/退还 | — | — |

## 依赖图

```
+----------+
| Frontend |
+----+-----+
     |
     v (所有请求)
+----+-----+
| Gateway  |--------> Auth Service (Token 验证)
+----+-----+
     |
     +--------> Auth Service
     +--------> Product Service
     +--------> Points Service
     +--------> Order Service
                    |
                    +---> Points Service (积分扣减/退还)
                    +---> Product Service (库存扣减/恢复)
```

## 通信模式

| 通信类型 | 说明 |
|---------|------|
| **Frontend → Gateway** | HTTP REST（Axios，Bearer Token） |
| **Gateway → Auth** | HTTP WebClient（响应式，每请求调用） |
| **Gateway → 后端服务** | HTTP 路由转发（Spring Cloud Gateway） |
| **Order → Points** | HTTP REST（同步，RestTemplate/WebClient） |
| **Order → Product** | HTTP REST（同步，RestTemplate/WebClient） |

## 数据所有权

每个服务拥有独立数据库，不直接访问其他服务的数据库：

| 服务 | 数据库 | 核心表 |
|------|--------|--------|
| Auth | shop_auth | t_user |
| Product | shop_product | t_product |
| Points | shop_points | t_points_account, t_points_transaction |
| Order | shop_order | t_order, t_order_item |

## 部署依赖

启动顺序：
1. **MySQL / Redis** — 基础设施
2. **Auth Service** — 认证基础（其他服务无强依赖，但 Gateway 需要）
3. **Product / Points Service** — 可并行启动
4. **Order Service** — 依赖 Product + Points
5. **Gateway Service** — 依赖 Auth，路由到所有后端
6. **Frontend** — 依赖 Gateway
