# Unit 6: api-gateway — 代码生成计划

## 单元上下文
- **单元名称**: api-gateway（API 网关）
- **类型**: Greenfield — 从零创建
- **架构**: 轻量 DDD（两个 Maven 模块：api-gateway-api + api-gateway-app）
- **基础包名**: `com.awsome.shop.gateway`
- **端口**: 8080
- **依赖**: Unit 7 (infrastructure) — Docker 网络；Unit 2 (auth-service)、Unit 3 (product-service)、Unit 4 (points-service)、Unit 5 (order-service) — 路由转发目标
- **被调用方**: frontend (Nginx) — 反向代理 /api/* 到 api-gateway

## 核心职责
- JWT 认证校验（HS256，与 auth-service 共享 JWT_SECRET）
- 三级权限控制（PUBLIC / AUTHENTICATED / ADMIN_ONLY）
- 精确前缀路由匹配，请求转发到下游微服务
- 请求头防伪造（清除 X-User-Id/X-User-Role）+ 用户信息注入
- 内部接口隔离（/api/internal/* 拦截）
- 下游容错（连接失败 502、超时 504、业务错误透传）

## 关联用户故事
- 横切关注点：所有需要认证/授权的用户故事均依赖 api-gateway

## 路由规则
| URL 前缀 | 目标服务 |
|---------|---------|
| /api/auth/* | auth-service:8001 |
| /api/admin/users/* | auth-service:8001 |
| /api/admin/products/* | product-service:8002 |
| /api/admin/categories/* | product-service:8002 |
| /api/admin/points/* | points-service:8003 |
| /api/admin/orders/* | order-service:8004 |
| /api/users/* | auth-service:8001 |
| /api/products/* | product-service:8002 |
| /api/categories/* | product-service:8002 |
| /api/files/* | product-service:8002 |
| /api/points/* | points-service:8003 |
| /api/orders/* | order-service:8004 |

## 模块结构

```
api-gateway/
├── pom.xml                          # 父 POM
├── api-gateway-api/                 # API 模块（DTO、模型）
│   ├── pom.xml
│   └── src/main/java/com/awsome/shop/gateway/
│       ├── common/                  # Result
│       └── model/                   # UserInfo, GatewayErrorCode
├── api-gateway-app/                 # APP 模块（实现、启动）
│   ├── pom.xml
│   └── src/main/java/com/awsome/shop/gateway/
│       ├── filter/                  # AuthenticationFilter, AuthorizationFilter
│       ├── config/                  # RouteConfig, AccessRuleConfig, RestTemplateConfig
│       ├── handler/                 # GlobalExceptionHandler
│       ├── GatewayApplication.java
│   └── src/main/resources/
│       ├── application.yml
│       └── application-docker.yml
└── Dockerfile
```

## 生成步骤

### Step 1: Maven 项目结构 — 父 POM + 子模块 POM
- [x] 创建 `api-gateway/pom.xml`（父 POM）
  - groupId: com.awsome.shop, artifactId: awsome-shop-api-gateway
  - 版本管理: Spring Boot 3.4.1, jjwt 0.12.6, Lombok
  - modules: api-gateway-api, api-gateway-app
- [x] 创建 `api-gateway/api-gateway-api/pom.xml`
  - 依赖: lombok
- [x] 创建 `api-gateway/api-gateway-app/pom.xml`
  - 依赖: api-gateway-api, spring-boot-starter-web, jjwt-api/impl/jackson, spring-boot-starter-actuator, lombok

### Step 2: 通用基础类 — Result
- [x] 创建 `api-gateway/api-gateway-api/src/main/java/com/awsome/shop/gateway/common/Result.java`
  - 统一响应格式 { code, message, data }
  - 静态工厂方法: error(String code, String message)

### Step 3: 模型 — GatewayErrorCode + UserInfo
- [x] 创建 `api-gateway/api-gateway-api/src/main/java/com/awsome/shop/gateway/model/GatewayErrorCode.java`
  - 枚举: GW_001(401,"未授权，请先登录"), GW_002(403,"权限不足"), GW_003(502,"服务暂时不可用"), GW_004(504,"请求超时"), GW_005(404,"资源不存在")
  - 字段: httpStatus(int), message(String)
- [x] 创建 `api-gateway/api-gateway-api/src/main/java/com/awsome/shop/gateway/model/UserInfo.java`
  - 字段: userId(Long), username(String), role(String)

### Step 4: 路由配置 — RouteConfig
- [x] 创建 `api-gateway/api-gateway-app/src/main/java/com/awsome/shop/gateway/config/RouteConfig.java`
  - @Configuration, @Value 注入 AUTH_SERVICE_URL, PRODUCT_SERVICE_URL, POINTS_SERVICE_URL, ORDER_SERVICE_URL
  - 路由规则列表（按优先级排序）：前缀 → 目标服务 URL
  - resolveTarget(String path): String — 精确前缀匹配，返回目标服务 URL 或 null

### Step 5: 权限配置 — AccessRuleConfig
- [x] 创建 `api-gateway/api-gateway-app/src/main/java/com/awsome/shop/gateway/config/AccessRuleConfig.java`
  - @Configuration
  - PUBLIC 规则: POST /api/auth/register, POST /api/auth/login
  - ADMIN_ONLY 规则: /api/admin/*, POST /api/files/upload, DELETE /api/files/*
  - determineAccessLevel(String method, String path): AccessLevel 枚举
  - 内部枚举 AccessLevel: PUBLIC, AUTHENTICATED, ADMIN_ONLY

### Step 6: RestTemplate 配置 — RestTemplateConfig
- [x] 创建 `api-gateway/api-gateway-app/src/main/java/com/awsome/shop/gateway/config/RestTemplateConfig.java`
  - @Configuration, @Bean RestTemplate
  - 连接超时 @Value CONNECT_TIMEOUT(默认1000ms), 读取超时 @Value READ_TIMEOUT(默认2000ms)

### Step 7: 认证过滤器 — AuthenticationFilter
- [x] 创建 `api-gateway/api-gateway-app/src/main/java/com/awsome/shop/gateway/filter/AuthenticationFilter.java`
  - @Component, @Order(1), implements Filter (jakarta.servlet.Filter)
  - JWT 校验逻辑：提取 Bearer token → 验证签名(HS256 + JWT_SECRET) → 验证过期 → 提取 payload
  - 校验通过：将 UserInfo 存入 request attribute
  - PUBLIC 端点：跳过认证，但仍清除伪造头
  - 所有校验失败统一返回 GW_001 (401)
  - 依赖: AccessRuleConfig（判定是否需要认证）, @Value JWT_SECRET

### Step 8: 授权过滤器 — AuthorizationFilter
- [x] 创建 `api-gateway/api-gateway-app/src/main/java/com/awsome/shop/gateway/filter/AuthorizationFilter.java`
  - @Component, @Order(2), implements Filter
  - 从 request attribute 获取 UserInfo 和 AccessLevel
  - ADMIN_ONLY 端点：校验 role == "ADMIN"，否则返回 GW_002 (403)
  - 请求头处理：清除 X-User-Id/X-User-Role → 注入（仅已认证请求）

### Step 9: 网关 Servlet — GatewayServlet（请求转发核心）
- [x] 创建 `api-gateway/api-gateway-app/src/main/java/com/awsome/shop/gateway/filter/GatewayServlet.java`
  - @Component, 注册为 Servlet 或使用 Controller 方式处理 /api/** 请求
  - 路由匹配: RouteConfig.resolveTarget(path)
  - 内部接口隔离: /api/internal/* → 返回 GW_005 (404)
  - 无匹配路由 → 返回 GW_005 (404)
  - 使用 RestTemplate 转发请求（保留方法、路径、查询参数、请求体、Content-Type）
  - 连接失败 → GW_003 (502), 超时 → GW_004 (504)
  - 下游正常响应（含 4xx/5xx）→ 透传

### Step 10: 全局异常处理 — GlobalExceptionHandler
- [x] 创建 `api-gateway/api-gateway-app/src/main/java/com/awsome/shop/gateway/handler/GlobalExceptionHandler.java`
  - @RestControllerAdvice
  - 处理未捕获异常 → 500 通用错误

### Step 11: 启动类 + 配置文件
- [x] 创建 `api-gateway/api-gateway-app/src/main/java/com/awsome/shop/gateway/GatewayApplication.java`
  - @SpringBootApplication
  - 启动时校验 JWT_SECRET 非空（@PostConstruct 或 CommandLineRunner）
- [x] 创建 `api-gateway/api-gateway-app/src/main/resources/application.yml`
  - server.port: 8080, 日志配置
- [x] 创建 `api-gateway/api-gateway-app/src/main/resources/application-docker.yml`
  - 环境变量引用: JWT_SECRET, AUTH_SERVICE_URL, PRODUCT_SERVICE_URL, POINTS_SERVICE_URL, ORDER_SERVICE_URL, CONNECT_TIMEOUT, READ_TIMEOUT, SERVER_PORT

### Step 12: 更新 Docker Compose — api-gateway 服务配置
- [x] 检查 `infrastructure/docker-compose.yml` 中 api-gateway 配置
  - 确认端口、环境变量、健康检查配置正确
  - 如需更新则修改

### Step 13: Dockerfile
- [x] 创建 `api-gateway/Dockerfile`
  - 多阶段构建: Maven 构建 + JRE 运行
  - 基于 eclipse-temurin:21-jre
  - EXPOSE 8080

### Step 14: 代码摘要文档
- [x] 创建 `aidlc-docs/construction/api-gateway/code/code-summary.md`
  - 列出所有生成的文件
  - 记录关键设计决策
  - 记录路由规则和权限规则
  - 记录错误码清单
