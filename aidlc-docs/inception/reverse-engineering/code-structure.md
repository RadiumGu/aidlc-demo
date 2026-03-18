# 代码结构

## 构建系统

### 后端
- **类型**: Maven（多模块）
- **Java 版本**: 21
- **Spring Boot**: 3.5.10
- **Spring Cloud**: 2025.0.0
- **每个服务模块结构**:
  - `common` — 公共工具、异常、枚举、注解
  - `domain` — 领域层（model/api/impl/repository-api/security-api）
  - `application` — 应用层（api/impl）
  - `infrastructure` — 基础设施层（repository/cache/security/gateway）
  - `interface` — 接口层（http/consumer）
  - `bootstrap` — 启动模块（配置、Application main）

### 前端
- **类型**: npm + Vite 7.3
- **框架**: React 19.2 + TypeScript 5.9
- **UI 库**: MUI (Material UI) 6.5
- **状态管理**: Zustand 5.0
- **路由**: React Router 7.13
- **HTTP 客户端**: Axios
- **国际化**: i18next

## DDD 分层模式（每个后端服务通用）

```
+--------------------------------------------------+
| bootstrap/        启动 + 配置                      |
+--------------------------------------------------+
| interface/        接口层                           |
|   interface-http/    REST Controller              |
|   interface-consumer/ MQ消费者（预留）             |
+--------------------------------------------------+
| application/      应用层                           |
|   application-api/   DTO + Service接口            |
|   application-impl/  Service实现                  |
+--------------------------------------------------+
| domain/           领域层                           |
|   domain-model/      领域实体                     |
|   domain-api/        领域服务接口                  |
|   domain-impl/       领域服务实现                  |
|   repository-api/    仓储接口                     |
|   security-api/      安全服务接口                  |
+--------------------------------------------------+
| infrastructure/   基础设施层                       |
|   repository/mysql-impl/  MyBatis-Plus仓储实现    |
|   cache/redis-impl/       Redis缓存配置           |
|   security/jwt-impl/      JWT/AES加密实现         |
|   gateway/gateway-impl/   (仅gateway-service)     |
+--------------------------------------------------+
| common/           公共模块                         |
|   annotation/        自定义注解                   |
|   enums/             错误码枚举                   |
|   exception/         异常类                       |
|   result/            统一返回结果                  |
|   dto/               通用DTO                      |
+--------------------------------------------------+
```

## 已有文件清单

### Gateway Service（关键文件）
- `infrastructure/filter/AuthenticationGatewayFilter.java` — JWT 认证全局过滤器
- `infrastructure/filter/AccessLogFilter.java` — 访问日志过滤器
- `infrastructure/filter/OperatorIdInjectionFilter.java` — 操作者ID注入
- `infrastructure/auth/client/AuthServiceClient.java` — Auth 服务 WebClient 调用
- `common/constants/RouteConstants.java` — 路由常量定义
- `domain/auth/service/AuthenticationService.java` — 认证领域服务接口（响应式）
- `domain/auth/model/AuthenticationResult.java` — 认证结果模型
- `domain/auth/model/TokenInfo.java` — 令牌信息模型

### Product Service（关键文件）
- `domain/model/product/ProductEntity.java` — 商品领域实体（已完整定义字段）
- `application/api/service/product/ProductApplicationService.java` — 商品应用服务接口
- `application/impl/service/product/ProductApplicationServiceImpl.java` — 商品应用服务实现
- `interface/http/controller/ProductController.java` — 商品 REST API（create/list）
- `repository/product/ProductRepository.java` — 商品仓储接口
- `repository/mysql/impl/product/ProductRepositoryImpl.java` — 商品仓储 MySQL 实现

### Auth/Points/Order Service
- 当前仅有脚手架代码（Test 示例 CRUD），无实际业务逻辑
- 每个服务均有完整的 DDD 分层结构，但领域模型为空（仅 TestEntity 占位）

### Frontend（关键文件）
- `src/App.tsx` — 应用入口，主题配置
- `src/router/index.tsx` — 路由配置（员工/管理员分离）
- `src/router/AuthGuard.tsx` — 路由守卫（角色校验）
- `src/store/useAuthStore.ts` — 认证状态管理（当前使用 Mock 数据）
- `src/store/useAppStore.ts` — 应用全局状态
- `src/services/request.ts` — Axios 封装（Bearer Token 自动注入）
- `src/pages/Login/index.tsx` — 登录页面
- `src/pages/ShopHome/index.tsx` — 商城首页
- `src/pages/Dashboard/index.tsx` — 管理后台
- `src/components/Layout/` — 员工/管理员布局组件
- `src/i18n/` — 中英文国际化配置

## 设计模式

### DDD 分层架构
- **位置**: 所有后端服务
- **目的**: 领域驱动设计，职责分离
- **实现**: domain-model / domain-api / repository-api / application-api 接口定义 → impl 实现

### Repository 模式
- **位置**: domain/repository-api → infrastructure/repository/mysql-impl
- **目的**: 持久化抽象
- **实现**: MyBatis-Plus Mapper + PO（Persistent Object）

### 全局异常处理
- **位置**: 每个服务的 interface/http/exception/GlobalExceptionHandler
- **目的**: 统一错误响应格式
- **实现**: @ControllerAdvice + ErrorCode 枚举

### 统一返回结果
- **位置**: common/result/Result.java
- **目的**: API 响应标准化
- **实现**: Result<T> 包装（code + message + data）

## 关键依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| Spring Boot | 3.5.10 | 应用框架 |
| Spring Cloud | 2025.0.0 | 微服务框架 |
| Spring Cloud Gateway | — | API 网关（仅 gateway-service） |
| MyBatis-Plus | 3.5.7 | ORM 框架 |
| Druid | 1.2.20 | 数据库连接池 |
| JJWT | 0.12.6 | JWT 令牌处理 |
| AWS SDK | 2.20.0 | AWS 服务接入（预留） |
| Micrometer Tracing | 1.3.5 | 分布式追踪 |
| Logstash Logback | 7.4 | JSON 日志 |
| React | 19.2.0 | UI 框架 |
| MUI | 6.5.0 | UI 组件库 |
| Zustand | 5.0.11 | 状态管理 |
| Axios | 1.13.5 | HTTP 客户端 |
