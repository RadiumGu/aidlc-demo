# Unit 5: order-service — 代码生成计划

## 单元上下文
- **单元名称**: order-service（兑换订单服务）
- **类型**: Greenfield — 从零创建
- **架构**: 轻量 DDD（两个 Maven 模块：order-service-api + order-service-app）
- **基础包名**: `com.awsome.shop.order`
- **端口**: 8004
- **依赖**: Unit 7 (infrastructure) — MySQL (order_db)、Docker 网络；Unit 3 (product-service) — 内部接口；Unit 4 (points-service) — 内部接口
- **被调用方**: api-gateway（路由转发 /api/orders/*, /api/admin/orders/*）

## 关联用户故事
- US-020: 员工兑换产品（创建兑换订单）
- US-021: 员工查看兑换历史
- US-022: 员工查看兑换详情
- US-023: 管理员查看所有兑换记录
- US-024: 管理员更新兑换状态（含取消自动退还）

## 跨服务调用
- product-service (8002): GET /api/internal/products/{id}, POST /api/internal/products/deduct-stock, POST /api/internal/products/restore-stock
- points-service (8003): GET /api/internal/points/balance/{userId}, POST /api/internal/points/deduct, POST /api/internal/points/rollback

## 模块结构

```
order-service/
├── pom.xml                          # 父 POM
├── order-service-api/               # API 模块（DTO、接口定义）
│   ├── pom.xml
│   └── src/main/java/com/awsome/shop/order/
│       ├── common/                  # ErrorCode, Result, BusinessException, PageResult
│       ├── dto/                     # 请求/响应 DTO
│       └── enums/                   # 枚举、错误码
├── order-service-app/               # APP 模块（实现、启动）
│   ├── pom.xml
│   └── src/main/java/com/awsome/shop/order/
│       ├── controller/              # REST 控制器
│       ├── service/                 # 业务服务
│       ├── repository/              # 数据访问（MyBatis-Plus）
│       ├── model/                   # PO 实体
│       ├── client/                  # 跨服务调用客户端
│       ├── config/                  # 配置类
│       ├── exception/               # 异常处理
│       └── OrderServiceApplication.java
│   └── src/main/resources/
│       ├── application.yml
│       └── application-docker.yml
└── Dockerfile
```

## 生成步骤

### Step 1: Maven 项目结构 — 父 POM + 子模块 POM
- [x] 创建 `order-service/pom.xml`（父 POM）
  - groupId: com.awsome.shop, artifactId: awsome-shop-order-service
  - 版本管理: Spring Boot 3.4.1, MyBatis-Plus 3.5.7, Druid 1.2.20, Lombok
  - modules: order-service-api, order-service-app
- [x] 创建 `order-service/order-service-api/pom.xml`
  - 依赖: lombok, jakarta-validation-api
- [x] 创建 `order-service/order-service-app/pom.xml`
  - 依赖: order-service-api, spring-boot-starter-web, spring-boot-starter-validation, mybatis-plus-spring-boot3-starter, druid-spring-boot-3-starter, mysql-connector-j, spring-boot-starter-actuator, lombok

### Step 2: 通用基础类 — ErrorCode + Result + BusinessException + PageResult
- [x] 创建 `order-service/order-service-api/src/main/java/com/awsome/shop/order/common/ErrorCode.java`（接口）
- [x] 创建 `order-service/order-service-api/src/main/java/com/awsome/shop/order/common/Result.java`
- [x] 创建 `order-service/order-service-api/src/main/java/com/awsome/shop/order/common/BusinessException.java`
- [x] 创建 `order-service/order-service-api/src/main/java/com/awsome/shop/order/common/PageResult.java`
  - 复制 points-service 模式，调整包名

### Step 3: 错误码定义 — OrderErrorCode（含 httpStatus 字段）
- [x] 创建 `order-service/order-service-api/src/main/java/com/awsome/shop/order/enums/OrderErrorCode.java`
  - ORDER_001(404, "产品不存在")
  - ORDER_002(400, "产品已下架")
  - ORDER_003(400, "库存不足")
  - ORDER_004(400, "积分账户不存在")
  - ORDER_005(400, "积分不足，无法兑换")
  - ORDER_006(404, "兑换记录不存在")
  - ORDER_007(403, "无权查看此兑换记录")
  - ORDER_008(500, "兑换处理失败，请稍后重试")
  - ORDER_009(400, "非法状态变更")
  - ORDER_010(500, "取消退还处理异常")
  - 采用 points-service 的 httpStatus 字段模式

### Step 4: 枚举 — OrderStatus
- [x] 创建 `order-service/order-service-api/src/main/java/com/awsome/shop/order/enums/OrderStatus.java`
  - PENDING, READY, COMPLETED, CANCELLED
  - 包含 canTransitionTo(OrderStatus target) 方法，封装状态流转规则

### Step 5: DTO — 请求/响应对象
- [x] 创建 `order-service/order-service-api/src/main/java/com/awsome/shop/order/dto/CreateOrderRequest.java`
  - @NotNull @Min(1) productId
- [x] 创建 `order-service/order-service-api/src/main/java/com/awsome/shop/order/dto/UpdateOrderStatusRequest.java`
  - @NotNull status (OrderStatus 枚举)
- [x] 创建 `order-service/order-service-api/src/main/java/com/awsome/shop/order/dto/OrderResponse.java`
  - id, userId, productId, productName, productImageUrl, pointsCost, status, createdAt, updatedAt

### Step 6: PO 实体 — OrderPO
- [x] 创建 `order-service/order-service-app/src/main/java/com/awsome/shop/order/model/OrderPO.java`
  - @TableName("orders"), MyBatis-Plus 注解
  - 字段: id, userId, productId, productName, productImageUrl, pointsCost, pointsTransactionId, status(OrderStatus), createdAt, updatedAt

### Step 7: MyBatis-Plus Mapper + 配置
- [x] 创建 `order-service/order-service-app/src/main/java/com/awsome/shop/order/repository/OrderMapper.java`
  - extends BaseMapper<OrderPO>
- [x] 创建 `order-service/order-service-app/src/main/java/com/awsome/shop/order/config/MybatisPlusConfig.java`
  - @MapperScan, 分页插件 PaginationInnerInterceptor

### Step 8: HTTP 客户端配置 — RestTemplate + 超时 + 重试
- [x] 创建 `order-service/order-service-app/src/main/java/com/awsome/shop/order/config/RestTemplateConfig.java`
  - 配置 RestTemplate Bean，连接超时 CONNECT_TIMEOUT(1s)，读取超时 READ_TIMEOUT(2s)
  - 通过 @Value 注入环境变量

### Step 9: 跨服务调用客户端 — ProductServiceClient + PointsServiceClient
- [x] 创建 `order-service/order-service-app/src/main/java/com/awsome/shop/order/client/ProductServiceClient.java`
  - getProduct(Long productId): Map — GET /api/internal/products/{id}
  - deductStock(Long productId, int quantity): void — POST /api/internal/products/deduct-stock
  - restoreStock(Long productId, int quantity): void — POST /api/internal/products/restore-stock
  - 基础 URL: @Value PRODUCT_SERVICE_URL
  - 超时/网络异常自动重试 1 次（仅对超时和网络异常，4xx 不重试）
- [x] 创建 `order-service/order-service-app/src/main/java/com/awsome/shop/order/client/PointsServiceClient.java`
  - getBalance(Long userId): Map — GET /api/internal/points/balance/{userId}
  - deductPoints(Long userId, int amount, Long orderId): Long(transactionId) — POST /api/internal/points/deduct
  - rollbackDeduction(Long transactionId): void — POST /api/internal/points/rollback
  - 基础 URL: @Value POINTS_SERVICE_URL
  - 超时/网络异常自动重试 1 次

### Step 10: 业务服务 — OrderService
- [x] 创建 `order-service/order-service-app/src/main/java/com/awsome/shop/order/service/OrderService.java`
  - **createOrder(Long userId, Long productId)**: 完整兑换流程
    1. 预校验：查询产品信息（存在性、ACTIVE、库存>0）+ 查询积分余额（充足性）
    2. 创建 PENDING 订单记录，获得 orderId
    3. 扣除积分（传入 orderId），保存 pointsTransactionId
    4. 扣减库存（quantity=1）
    5. 失败补偿：积分扣除失败→删除订单；库存扣减失败→回滚积分+删除订单
  - **getMyOrders(Long userId, int page, int size)**: 员工查询自己的订单（分页，按 createdAt DESC）
  - **getOrderDetail(Long userId, Long orderId)**: 员工查询详情（含归属校验 ORDER_007）
  - **getAllOrders(int page, int size, String keyword, String startDate, String endDate)**: 管理员查看所有记录
  - **updateOrderStatus(Long orderId, OrderStatus targetStatus)**: 管理员更新状态
    - 状态流转校验（canTransitionTo）
    - 取消时自动退还：回滚积分 + 恢复库存（最大努力，失败记日志不阻塞）
  - PO → OrderResponse 转换方法

### Step 11: 控制器 — OrderController + AdminOrderController
- [x] 创建 `order-service/order-service-app/src/main/java/com/awsome/shop/order/controller/OrderController.java`
  - POST /api/orders — 创建兑换订单（userId 从 X-User-Id 请求头获取）
  - GET /api/orders — 查询当前用户兑换历史（分页）
  - GET /api/orders/{id} — 查询兑换详情
- [x] 创建 `order-service/order-service-app/src/main/java/com/awsome/shop/order/controller/AdminOrderController.java`
  - GET /api/admin/orders — 查看所有兑换记录（分页、keyword、startDate、endDate）
  - PUT /api/admin/orders/{id}/status — 更新兑换状态

### Step 12: 全局异常处理 — GlobalExceptionHandler
- [x] 创建 `order-service/order-service-app/src/main/java/com/awsome/shop/order/exception/GlobalExceptionHandler.java`
  - @RestControllerAdvice
  - 处理 BusinessException → 从 OrderErrorCode 的 httpStatus 字段映射 HTTP 状态码
  - 处理 MethodArgumentNotValidException → 400
  - 处理 Exception → 500 通用错误
  - 采用 points-service 的 resolveHttpStatus 模式

### Step 13: 启动类 + 配置文件
- [x] 创建 `order-service/order-service-app/src/main/java/com/awsome/shop/order/OrderServiceApplication.java`
  - @SpringBootApplication
- [x] 创建 `order-service/order-service-app/src/main/resources/application.yml`
  - server.port: 8004, 本地开发数据源, MyBatis-Plus 配置
- [x] 创建 `order-service/order-service-app/src/main/resources/application-docker.yml`
  - 环境变量引用: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, SERVER_PORT
  - PRODUCT_SERVICE_URL, POINTS_SERVICE_URL, CONNECT_TIMEOUT, READ_TIMEOUT

### Step 14: Dockerfile
- [x] 创建 `order-service/Dockerfile`
  - 多阶段构建: Maven 构建 + JRE 运行
  - 基于 eclipse-temurin:21-jre
  - EXPOSE 8004

### Step 15: 代码摘要文档
- [x] 创建 `aidlc-docs/construction/order-service/code/code-summary.md`
  - 列出所有生成的文件
  - 记录关键设计决策
  - 记录 API 端点清单
  - 记录跨服务调用清单
