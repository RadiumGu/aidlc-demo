# Unit 4: points-service — 代码生成计划

## 单元上下文
- **单元名称**: points-service（积分服务）
- **类型**: Greenfield — 从零创建
- **架构**: 轻量 DDD（两个 Maven 模块：points-service-api + points-service-app）
- **基础包名**: `com.awsome.shop.points`
- **端口**: 8003
- **数据库**: points_db（4 张表：point_balances, point_transactions, system_configs, distribution_batches）
- **依赖**: Unit 7 (infrastructure) — MySQL 数据库、Docker 网络
- **被调用方**: auth-service（初始化积分）、order-service（扣除/回滚/查询余额）、api-gateway（路由转发）

## 关联用户故事
- US-007: 员工查看积分余额
- US-008: 员工查看积分变动历史
- US-009: 管理员查看员工积分列表
- US-010: 管理员手动调整积分
- US-011: 管理员配置每月发放额度
- US-012: 系统每月自动发放积分
- 内部接口: 积分初始化/扣除/回滚/查询（供 auth-service、order-service 调用）

## 模块结构

```
points-service/
├── pom.xml                          # 父 POM
├── points-service-api/              # API 模块（DTO、枚举、通用类）
│   ├── pom.xml
│   └── src/main/java/com/awsome/shop/points/
│       ├── common/                  # ErrorCode, Result, BusinessException, PageResult
│       ├── dto/                     # 请求/响应 DTO
│       └── enums/                   # 枚举、错误码
├── points-service-app/              # APP 模块（实现、启动）
│   ├── pom.xml
│   └── src/main/java/com/awsome/shop/points/
│       ├── controller/              # REST 控制器
│       ├── service/                 # 业务服务
│       ├── repository/              # 数据访问（MyBatis-Plus Mapper）
│       ├── model/                   # PO 实体
│       ├── config/                  # 配置类
│       ├── scheduler/               # 定时任务
│       ├── exception/               # 异常处理
│       └── PointsServiceApplication.java
│   └── src/main/resources/
│       ├── application.yml
│       └── application-docker.yml
└── Dockerfile
```

## 生成步骤

### Step 1: Maven 项目结构 — 父 POM + 子模块 POM
- [x] 创建 `points-service/pom.xml`（父 POM）
  - groupId: com.awsome.shop
  - artifactId: awsome-shop-points-service
  - 版本管理: Spring Boot 3.4.1, MyBatis-Plus 3.5.7, Druid 1.2.20, Lombok
  - modules: points-service-api, points-service-app
- [x] 创建 `points-service/points-service-api/pom.xml`
  - 依赖: lombok, jakarta-validation-api
- [x] 创建 `points-service/points-service-app/pom.xml`
  - 依赖: points-service-api, spring-boot-starter-web, spring-boot-starter-validation, mybatis-plus-spring-boot3-starter, druid-spring-boot-3-starter, mysql-connector-j, spring-boot-starter-actuator, lombok
  - spring-boot-maven-plugin 打包

### Step 2: 通用基础类 — ErrorCode + Result + BusinessException + PageResult
- [x] 创建 `points-service-api/src/main/java/com/awsome/shop/points/common/ErrorCode.java`（接口）
- [x] 创建 `points-service-api/src/main/java/com/awsome/shop/points/common/Result.java`
- [x] 创建 `points-service-api/src/main/java/com/awsome/shop/points/common/BusinessException.java`
- [x] 创建 `points-service-api/src/main/java/com/awsome/shop/points/common/PageResult.java`
  - 复制 product-service 的模式，调整包名为 com.awsome.shop.points.common

### Step 3: 错误码定义 — PointsErrorCode
- [x] 创建 `points-service-api/src/main/java/com/awsome/shop/points/enums/PointsErrorCode.java`
  - BALANCE_NOT_FOUND("POINTS_001", 404, "积分余额记录不存在")
  - INSUFFICIENT_FOR_ADJUST("POINTS_002", 400, "扣除后余额不足")
  - INSUFFICIENT_FOR_REDEEM("POINTS_003", 400, "积分不足，无法兑换")
  - TRANSACTION_NOT_FOUND("POINTS_004", 404, "积分变动记录不存在")
  - ONLY_REDEMPTION_ROLLBACK("POINTS_005", 400, "只能回滚兑换扣除记录")
  - ALREADY_ROLLED_BACK("POINTS_006", 409, "该笔扣除已回滚，不可重复操作")
  - CONFIG_NOT_FOUND("POINTS_007", 404, "配置项不存在")

### Step 4: 枚举 — TransactionType
- [x] 创建 `points-service-api/src/main/java/com/awsome/shop/points/enums/TransactionType.java`
  - DISTRIBUTION("系统自动发放")
  - MANUAL_ADD("管理员手动增加")
  - MANUAL_DEDUCT("管理员手动扣除")
  - REDEMPTION("兑换扣除")
  - ROLLBACK("兑换回滚")

### Step 5: DTO — 请求对象（5 个）
- [x] 创建 `points-service-api/src/main/java/com/awsome/shop/points/dto/InitPointsRequest.java`
  - @NotNull @Min(1) userId
- [x] 创建 `points-service-api/src/main/java/com/awsome/shop/points/dto/AdjustPointsRequest.java`
  - @NotNull @Min(1) userId, @NotNull amount（≠ 0）, @NotBlank @Size(max=500) remark
- [x] 创建 `points-service-api/src/main/java/com/awsome/shop/points/dto/DeductPointsRequest.java`
  - @NotNull @Min(1) userId, @NotNull @Min(1) amount, @NotNull @Min(1) orderId
- [x] 创建 `points-service-api/src/main/java/com/awsome/shop/points/dto/RollbackDeductionRequest.java`
  - @NotNull @Min(1) transactionId
- [x] 创建 `points-service-api/src/main/java/com/awsome/shop/points/dto/UpdateDistributionConfigRequest.java`
  - @NotNull @Min(1) amount

### Step 6: DTO — 响应对象（4 个）
- [x] 创建 `points-service-api/src/main/java/com/awsome/shop/points/dto/PointBalanceResponse.java`
  - userId, balance
- [x] 创建 `points-service-api/src/main/java/com/awsome/shop/points/dto/PointTransactionResponse.java`
  - id, userId, type, amount, balanceAfter, referenceId, operatorId, remark, createdAt
- [x] 创建 `points-service-api/src/main/java/com/awsome/shop/points/dto/UserPointResponse.java`
  - userId, balance
- [x] 创建 `points-service-api/src/main/java/com/awsome/shop/points/dto/DistributionConfigResponse.java`
  - amount, updatedAt

### Step 7: PO 实体（4 个）
- [x] 创建 `points-service-app/src/main/java/com/awsome/shop/points/model/PointBalancePO.java`
  - @TableName("point_balances"), 字段: id, userId, balance, createdAt, updatedAt
- [x] 创建 `points-service-app/src/main/java/com/awsome/shop/points/model/PointTransactionPO.java`
  - @TableName("point_transactions"), 字段: id, userId, type(TransactionType), amount, balanceAfter, referenceId, operatorId, remark, createdAt
- [x] 创建 `points-service-app/src/main/java/com/awsome/shop/points/model/SystemConfigPO.java`
  - @TableName("system_configs"), 字段: id, configKey, configValue, description, updatedAt
- [x] 创建 `points-service-app/src/main/java/com/awsome/shop/points/model/DistributionBatchPO.java`
  - @TableName("distribution_batches"), 字段: id, distributionAmount, totalCount, successCount, failCount, status, startedAt, completedAt

### Step 8: MyBatis-Plus Mapper（4 个）+ 配置
- [x] 创建 `points-service-app/src/main/java/com/awsome/shop/points/repository/PointBalanceMapper.java`
  - extends BaseMapper<PointBalancePO>
  - 自定义: selectByUserIdForUpdate(Long userId) — @Select("SELECT * FROM point_balances WHERE user_id = #{userId} FOR UPDATE")
- [x] 创建 `points-service-app/src/main/java/com/awsome/shop/points/repository/PointTransactionMapper.java`
  - extends BaseMapper<PointTransactionPO>
- [x] 创建 `points-service-app/src/main/java/com/awsome/shop/points/repository/SystemConfigMapper.java`
  - extends BaseMapper<SystemConfigPO>
- [x] 创建 `points-service-app/src/main/java/com/awsome/shop/points/repository/DistributionBatchMapper.java`
  - extends BaseMapper<DistributionBatchPO>
- [x] 创建 `points-service-app/src/main/java/com/awsome/shop/points/config/MybatisPlusConfig.java`
  - @MapperScan("com.awsome.shop.points.repository"), 分页插件 PaginationInnerInterceptor

### Step 9: 业务服务 — ConfigService
- [x] 创建 `points-service-app/src/main/java/com/awsome/shop/points/service/ConfigService.java`
  - getDistributionConfig(): DistributionConfigResponse — 查询 points.distribution.amount，不存在返回默认值 100
  - updateDistributionConfig(UpdateDistributionConfigRequest): DistributionConfigResponse — UPSERT 配置
  - getDistributionAmount(): int — 内部方法，供 DistributionService 调用

### Step 10: 业务服务 — PointsService
- [x] 创建 `points-service-app/src/main/java/com/awsome/shop/points/service/PointsService.java`
  - initPoints(InitPointsRequest): PointBalanceResponse — 幂等初始化
  - getBalance(Long userId): PointBalanceResponse — 查询余额
  - getTransactions(Long userId, int page, int size): PageResult<PointTransactionResponse> — 分页查询变动历史
  - getAdminBalances(int page, int size, String keyword): PageResult<UserPointResponse> — 管理员查看所有余额
  - getAdminTransactions(Long userId, int page, int size, String type): PageResult<PointTransactionResponse> — 管理员查看指定用户变动（可按类型筛选）
  - adjustPoints(AdjustPointsRequest, Long operatorId): PointTransactionResponse — 手动调整（悲观锁 @Transactional）
  - deductPoints(DeductPointsRequest): PointTransactionResponse — 兑换扣除（悲观锁 @Transactional）
  - rollbackDeduction(RollbackDeductionRequest): void — 兑换回滚（悲观锁 @Transactional，唯一性校验）
  - getBalanceByUserId(Long userId): PointBalanceResponse — 内部查询

### Step 11: 业务服务 — DistributionService
- [x] 创建 `points-service-app/src/main/java/com/awsome/shop/points/service/DistributionService.java`
  - executeDistribution(): void — 执行发放主流程
    1. 检查是否有 RUNNING 状态的批次（补发逻辑）
    2. 创建新批次记录（status=RUNNING）
    3. 查询所有 point_balances 用户
    4. 逐条发放（独立事务：更新余额 + 创建流水）
    5. 更新批次状态（COMPLETED/FAILED）
  - resumeDistribution(DistributionBatchPO batch): void — 补发逻辑
    1. 查询已发放用户（该时间段内 type=DISTRIBUTION 的流水）
    2. 计算差集
    3. 为未发放用户逐条补发
  - distributeToUser(Long userId, int amount, String remark): boolean — 单用户发放（独立事务 @Transactional(propagation=REQUIRES_NEW)）

### Step 12: 定时任务 — DistributionScheduler
- [x] 创建 `points-service-app/src/main/java/com/awsome/shop/points/scheduler/DistributionScheduler.java`
  - @Scheduled(cron = "0 0 2 1 * ?") — 每月1日凌晨2:00
  - 调用 DistributionService.executeDistribution()
  - 日志记录执行开始/结束

### Step 13: 控制器 — 3 个 Controller
- [x] 创建 `points-service-app/src/main/java/com/awsome/shop/points/controller/PointsController.java`
  - GET /api/points/balance — 查询当前用户积分余额（X-User-Id）
  - GET /api/points/transactions — 查询当前用户积分变动历史（分页）
- [x] 创建 `points-service-app/src/main/java/com/awsome/shop/points/controller/AdminPointsController.java`
  - GET /api/admin/points/balances — 查看所有员工积分余额（分页、keyword）
  - GET /api/admin/points/transactions/{userId} — 查看指定员工变动明细（分页、type 筛选）
  - POST /api/admin/points/adjust — 手动调整积分
  - GET /api/admin/points/config — 获取发放配置
  - PUT /api/admin/points/config — 更新发放配置
- [x] 创建 `points-service-app/src/main/java/com/awsome/shop/points/controller/InternalPointsController.java`
  - POST /api/internal/points/init — 初始化用户积分余额
  - POST /api/internal/points/deduct — 兑换扣除积分
  - POST /api/internal/points/rollback — 回滚积分扣除
  - GET /api/internal/points/balance/{userId} — 查询指定用户积分余额

### Step 14: 全局异常处理 — GlobalExceptionHandler
- [x] 创建 `points-service-app/src/main/java/com/awsome/shop/points/exception/GlobalExceptionHandler.java`
  - @RestControllerAdvice
  - 处理 BusinessException → 根据 PointsErrorCode 的 httpStatus 映射 HTTP 状态码
  - 处理 MethodArgumentNotValidException → 400
  - 处理 PessimisticLockingFailureException → 409 冲突
  - 处理 Exception → 500 通用错误

### Step 15: 启动类 + 配置文件
- [x] 创建 `points-service-app/src/main/java/com/awsome/shop/points/PointsServiceApplication.java`
  - @SpringBootApplication
  - @EnableScheduling — 启用定时任务
- [x] 创建 `points-service-app/src/main/resources/application.yml`
  - server.port: 8003
  - 本地开发数据源配置（localhost:3306/points_db）
  - MyBatis-Plus 配置（map-underscore-to-camel-case, id-type: auto）
  - logging 配置
- [x] 创建 `points-service-app/src/main/resources/application-docker.yml`
  - 环境变量引用: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, SERVER_PORT

### Step 16: Dockerfile
- [x] 创建 `points-service/Dockerfile`
  - 多阶段构建: Maven 构建 + JRE 运行
  - 基于 eclipse-temurin:21-jre
  - EXPOSE 8003
  - --spring.profiles.active=docker

### Step 17: 代码摘要文档
- [x] 创建 `aidlc-docs/construction/points-service/code/code-summary.md`
  - 列出所有生成的文件
  - 记录关键设计决策
  - 记录 API 端点清单
