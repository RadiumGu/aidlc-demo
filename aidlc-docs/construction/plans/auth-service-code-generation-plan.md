# Unit 2: auth-service — 代码生成计划

## 单元上下文
- **单元名称**: auth-service（认证服务）
- **类型**: Brownfield — 在已有 DDD 六模块框架上实现业务逻辑
- **架构**: DDD 六模块（common / domain / application / interface / infrastructure / bootstrap）
- **基础包名**: `com.awsome.shop.auth`
- **端口**: 8001
- **依赖**: Unit 7 (infrastructure) — MySQL 数据库、Docker 网络
- **运行时软依赖**: points-service (8003) — 注册时初始化积分（可降级）

## 关联用户故事
- US-001: 员工注册
- US-002: 员工登录
- US-003: 员工退出登录
- US-004: 获取当前用户信息
- US-005: 管理员查看用户列表
- US-006: 管理员查看用户详情
- US-007: 管理员更新用户信息/状态

## 已有代码框架
- 6 个 Maven 模块结构已搭建，包路径已创建
- common 模块已有：ErrorCode 接口、Result<T>、BusinessException、PageResult<T>、SampleErrorCode
- bootstrap 模块已有：Application.java、application.yml、application-docker.yml
- 所有 POM 依赖已配置（Spring Boot 3.4.1、MyBatis-Plus 3.5.7、JWT jjwt 0.12.6、Lombok 等）

## 需要修正的已有配置
- `application.yml` 中 `server.port: 8080` → 需改为 `8001`
- `application-docker.yml` 中 `server.port: 8081` → 需改为 `8001`
- `application-docker.yml` 中 `DB_USERNAME` → 需改为 `DB_USER`（与 .env 一致）

## 生成步骤

### Step 1: 配置修正 — application.yml & application-docker.yml
- [x] 修改 `auth-service/bootstrap/src/main/resources/application.yml`：`server.port` 改为 `8001`
- [x] 修改 `auth-service/bootstrap/src/main/resources/application-docker.yml`：
  - `server.port` 改为 `8001`
  - `DB_USERNAME` 改为 `DB_USER`
  - 添加 `POINTS_SERVICE_URL` 环境变量配置
  - 清理不需要的配置（login.max-failed-attempts、lock-duration、encryption-key 等 MVP 不需要的）

### Step 2: 错误码定义 — AuthErrorCode
- [x] 创建 `auth-service/common/src/main/java/com/awsome/shop/auth/common/enums/AuthErrorCode.java`
  - 实现 ErrorCode 接口
  - AUTH_001 (CONFLICT_001, "用户名已存在")
  - AUTH_002 (CONFLICT_002, "工号已存在")
  - AUTH_003 (AUTH_001, "用户名或密码错误")
  - AUTH_004 (NOT_FOUND_001, "用户不存在")
  - AUTH_005 (PARAM_001, "请求参数校验失败")
  - AUTH_006 (AUTHZ_001, "账号已被禁用")
  - AUTH_007 (PARAM_002, "不能禁用自己的账号")
  - 注意：code 前缀需匹配 ErrorCode 接口的 HTTP 状态码映射规则

### Step 3: 领域模型 — User 实体 + 枚举
- [x] 创建 `auth-service/domain/domain-model/src/main/java/com/awsome/shop/auth/domain/model/User.java`
  - 字段：id, username, password, name, employeeId, role, status, createdAt, updatedAt
- [x] 创建 `auth-service/domain/domain-model/src/main/java/com/awsome/shop/auth/domain/model/enums/Role.java`
  - EMPLOYEE, ADMIN
- [x] 创建 `auth-service/domain/domain-model/src/main/java/com/awsome/shop/auth/domain/model/enums/UserStatus.java`
  - ACTIVE, DISABLED

### Step 4: Repository 接口 — UserRepository
- [x] 创建 `auth-service/domain/repository-api/src/main/java/com/awsome/shop/auth/domain/repository/UserRepository.java`
  - findById(Long id): User
  - findByUsername(String username): User
  - findByEmployeeId(String employeeId): User
  - save(User user): User
  - update(User user): void
  - findPage(int page, int size, String keyword): PageResult<User>

### Step 5: Security 接口 — JwtTokenProvider
- [x] 创建 `auth-service/domain/security-api/src/main/java/com/awsome/shop/auth/domain/security/JwtTokenProvider.java`
  - generateToken(Long userId, String username, String role): String
  - getExpiration(): long

### Step 6: Domain 服务接口 — AuthService & UserService
- [x] 创建 `auth-service/domain/domain-api/src/main/java/com/awsome/shop/auth/domain/service/AuthService.java`
  - register(User user): User
  - login(String username, String password): User
- [x] 创建 `auth-service/domain/domain-api/src/main/java/com/awsome/shop/auth/domain/service/UserService.java`
  - getUserById(Long id): User
  - getUserList(int page, int size, String keyword): PageResult<User>
  - updateUser(Long id, String name, UserStatus status, Long operatorId): User

### Step 7: Domain 服务实现 — AuthServiceImpl & UserServiceImpl
- [x] 创建 `auth-service/domain/domain-impl/src/main/java/com/awsome/shop/auth/domain/service/impl/AuthServiceImpl.java`
  - 注册：唯一性校验 → bcrypt 加密 → 保存
  - 登录：查询用户 → 状态检查 → 密码校验
- [x] 创建 `auth-service/domain/domain-impl/src/main/java/com/awsome/shop/auth/domain/service/impl/UserServiceImpl.java`
  - 查询、分页、更新（含禁用自己校验）

### Step 8: Application 层 DTO — 请求/响应对象
- [x] 创建 `auth-service/application/application-api/src/main/java/com/awsome/shop/auth/application/dto/RegisterRequest.java`
  - Jakarta Validation 注解
- [x] 创建 `auth-service/application/application-api/src/main/java/com/awsome/shop/auth/application/dto/LoginRequest.java`
- [x] 创建 `auth-service/application/application-api/src/main/java/com/awsome/shop/auth/application/dto/UpdateUserRequest.java`
- [x] 创建 `auth-service/application/application-api/src/main/java/com/awsome/shop/auth/application/dto/UserResponse.java`
- [x] 创建 `auth-service/application/application-api/src/main/java/com/awsome/shop/auth/application/dto/TokenResponse.java`

### Step 9: Application 服务 — AuthAppService
- [x] 创建 `auth-service/application/application-api/src/main/java/com/awsome/shop/auth/application/service/AuthAppService.java`（接口）
  - register(RegisterRequest): UserResponse
  - login(LoginRequest): TokenResponse
  - getCurrentUser(Long userId): UserResponse
  - getUserList(int page, int size, String keyword): PageResult<UserResponse>
  - getUserById(Long id): UserResponse
  - updateUser(Long id, UpdateUserRequest, Long operatorId): UserResponse
- [x] 创建 `auth-service/application/application-impl/src/main/java/com/awsome/shop/auth/application/service/impl/AuthAppServiceImpl.java`（实现）
  - DTO ↔ Domain 转换
  - 调用 Domain 服务 + JWT 生成
  - 调用 PointsClient 初始化积分（降级处理）

### Step 10: Infrastructure — MySQL 实现（UserPO + Mapper + Repository 实现）
- [x] 创建 `auth-service/infrastructure/repository/mysql-impl/src/main/java/com/awsome/shop/auth/repository/mysql/po/UserPO.java`
  - MyBatis-Plus @TableName("users"), @TableId
- [x] 创建 `auth-service/infrastructure/repository/mysql-impl/src/main/java/com/awsome/shop/auth/repository/mysql/mapper/UserMapper.java`
  - extends BaseMapper<UserPO>
- [x] 创建 `auth-service/infrastructure/repository/mysql-impl/src/main/java/com/awsome/shop/auth/repository/mysql/impl/UserRepositoryImpl.java`
  - 实现 UserRepository 接口
  - PO ↔ Domain 转换
  - MyBatis-Plus 分页查询 + keyword 模糊搜索

### Step 11: Infrastructure — JWT 实现
- [x] 创建 `auth-service/infrastructure/security/jwt-impl/src/main/java/com/awsome/shop/auth/security/jwt/JwtTokenProviderImpl.java`
  - 实现 JwtTokenProvider 接口
  - 使用 jjwt 库，HS256 签名
  - 从 application-docker.yml 读取 security.jwt.secret / expiration

### Step 12: Infrastructure — PointsClient（跨服务调用）
- [x] 创建 `auth-service/application/application-impl/src/main/java/com/awsome/shop/auth/application/client/PointsClient.java`
  - 使用 RestTemplate/RestClient 调用 points-service
  - POST http://points-service:8003/api/internal/points/init
  - 超时配置：连接 1s + 读取 2s
  - 降级处理：调用失败仅记录日志

### Step 13: Interface 层 — Controller
- [x] 创建 `auth-service/interface/interface-http/src/main/java/com/awsome/shop/auth/interfaces/http/AuthController.java`
  - POST /api/auth/register → register
  - POST /api/auth/login → login
  - POST /api/auth/logout → 直接返回成功
- [x] 创建 `auth-service/interface/interface-http/src/main/java/com/awsome/shop/auth/interfaces/http/UserController.java`
  - GET /api/users/me → getCurrentUser（从 X-User-Id 请求头获取）
- [x] 创建 `auth-service/interface/interface-http/src/main/java/com/awsome/shop/auth/interfaces/http/AdminUserController.java`
  - GET /api/admin/users → getUserList
  - GET /api/admin/users/{id} → getUserById
  - PUT /api/admin/users/{id} → updateUser

### Step 14: 全局异常处理 — GlobalExceptionHandler
- [x] 创建 `auth-service/interface/interface-http/src/main/java/com/awsome/shop/auth/interfaces/http/handler/GlobalExceptionHandler.java`
  - @RestControllerAdvice
  - 处理 BusinessException → 根据 errorCode 前缀映射 HTTP 状态码
  - 处理 MethodArgumentNotValidException → AUTH_005
  - 处理 Exception → 500 通用错误

### Step 15: Dockerfile
- [x] 创建 `auth-service/Dockerfile`
  - 多阶段构建：Maven 构建 + JRE 运行
  - 基于 eclipse-temurin:21-jre
  - EXPOSE 8001

### Step 16: 代码摘要文档
- [x] 创建 `aidlc-docs/construction/auth-service/code/code-summary.md`
  - 列出所有生成/修改的文件
  - 记录关键设计决策
  - 记录 API 端点清单
