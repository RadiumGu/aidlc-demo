# 系统架构

## 系统概述

AWSomeShop 采用微服务架构，基于 Spring Cloud Gateway + Spring Boot 3.x 构建。前端使用 React + TypeScript，通过网关统一访问后端各微服务。

## 架构图

```
+------------------+
|   React 前端     |
|  (Vite + MUI)    |
+--------+---------+
         |
         v
+--------+---------+
|  Gateway Service  |
| (Spring Cloud GW) |
|   Port: 8080      |
+--+---+---+---+---+
   |   |   |   |
   v   v   v   v
+---+ +---+ +---+ +---+
|Auth| |Prod| |Pts| |Ord|
|8001| |8002| |8003| |8004|
+---+ +---+ +---+ +---+
  |     |     |     |
  v     v     v     v
+---------------------+
|   MySQL (每服务独立DB) |
+---------------------+
+---------------------+
|       Redis          |
+---------------------+
```

## 组件描述

### Gateway Service（网关服务）
- **职责**: API 网关，统一入口
- **依赖**: Auth Service（令牌验证）
- **类型**: Application（Spring Cloud Gateway - Reactive）
- **关键能力**:
  - JWT 令牌认证（通过调用 Auth Service 验证）
  - 路由分发到后端各服务
  - 操作者ID注入请求头（X-Operator-Id）
  - 访问日志记录
  - CORS 跨域支持
  - Swagger API 文档聚合

### Auth Service（认证服务）
- **职责**: 用户认证与授权
- **依赖**: MySQL, Redis
- **类型**: Application（Spring Boot）
- **关键能力**: JWT 令牌签发与验证（骨架已有，业务逻辑待实现）

### Product Service（商品服务）
- **职责**: 商品信息管理
- **依赖**: MySQL, Redis
- **类型**: Application（Spring Boot）
- **关键能力**: 商品创建、商品列表查询（已部分实现）

### Points Service（积分服务）
- **职责**: 积分账户管理
- **依赖**: MySQL, Redis
- **类型**: Application（Spring Boot）
- **关键能力**: 积分 CRUD（骨架已有，业务逻辑待实现）

### Order Service（订单服务）
- **职责**: 兑换订单管理
- **依赖**: MySQL, Redis
- **类型**: Application（Spring Boot）
- **关键能力**: 订单 CRUD（骨架已有，业务逻辑待实现）

### Frontend（前端）
- **职责**: 用户界面
- **依赖**: Gateway Service（所有 API 请求）
- **类型**: SPA（React 19 + TypeScript）
- **关键能力**: 登录、商品浏览、管理后台（Mock 数据阶段）

## 数据流

### 员工商品浏览流程
```
员工 -> 前端(React) -> Gateway(:8080) -> Product Service(:8002) -> MySQL
                          |
                          +-> Auth验证: Gateway -> Auth Service(:8001)
```

### 认证流程
```
用户 -> 前端(React) -> Gateway(:8080) -> Auth Service(:8001) -> MySQL
                                              |
                                              +-> 签发JWT Token
```

## 集成点

- **数据库**: MySQL（每服务独立数据库，Druid 连接池）
- **缓存**: Redis（Lettuce 客户端）
- **数据库迁移**: Flyway
- **API 文档**: Swagger/OpenAPI 3.0（通过网关聚合）
- **可观测性**: Micrometer Tracing + Prometheus metrics
- **日志**: Logstash Logback Encoder（JSON格式）

## 基础设施组件

- **部署模型**: 本地开发 / 容器化部署（配置已就绪）
- **服务发现**: 当前使用硬编码 URL（local profile），可扩展为服务注册发现
- **网络**: Gateway 统一入口 8080，后端服务各自端口（8001-8004）
