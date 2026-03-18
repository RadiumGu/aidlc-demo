# Unit 2: auth-service — 代码生成摘要

## 生成时间
2026-03-18

## 修改的文件（2 个）
- `auth-service/bootstrap/src/main/resources/application.yml` — server.port 改为 8001
- `auth-service/bootstrap/src/main/resources/application-docker.yml` — 端口、环境变量名、积分服务配置

## 新建的文件（20 个）

### common 模块
- `AuthErrorCode.java` — 7 个业务错误码枚举

### domain-model 模块
- `User.java` — 用户领域实体
- `Role.java` — 角色枚举（EMPLOYEE, ADMIN）
- `UserStatus.java` — 账号状态枚举（ACTIVE, DISABLED）

### repository-api 模块
- `UserRepository.java` — 用户仓储接口

### security-api 模块
- `JwtTokenProvider.java` — JWT 令牌提供者接口

### domain-api 模块
- `AuthService.java` — 认证领域服务接口
- `UserService.java` — 用户领域服务接口

### domain-impl 模块
- `AuthServiceImpl.java` — 认证服务实现（注册+登录）
- `UserServiceImpl.java` — 用户服务实现（查询+更新）

### application-api 模块
- `RegisterRequest.java` — 注册请求 DTO
- `LoginRequest.java` — 登录请求 DTO
- `UpdateUserRequest.java` — 更新用户请求 DTO
- `UserResponse.java` — 用户信息响应 DTO
- `TokenResponse.java` — 登录令牌响应 DTO
- `AuthAppService.java` — 应用服务接口

### application-impl 模块
- `AuthAppServiceImpl.java` — 应用服务实现
- `PointsClient.java` — 积分服务 HTTP 客户端

### mysql-impl 模块
- `UserPO.java` — 用户持久化对象
- `UserMapper.java` — MyBatis-Plus Mapper
- `UserRepositoryImpl.java` — 仓储 MySQL 实现
- `MybatisPlusConfig.java` — 分页插件 + 自动填充配置

### jwt-impl 模块
- `JwtTokenProviderImpl.java` — JWT 令牌生成实现

### interface-http 模块
- `AuthController.java` — 认证控制器
- `UserController.java` — 用户控制器
- `AdminUserController.java` — 管理员用户管理控制器
- `GlobalExceptionHandler.java` — 全局异常处理器

### 根目录
- `Dockerfile` — 多阶段构建

## API 端点清单

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/auth/register | 用户注册 | 公开 |
| POST | /api/auth/login | 用户登录 | 公开 |
| POST | /api/auth/logout | 退出登录 | 认证 |
| GET | /api/users/me | 当前用户信息 | 认证 |
| GET | /api/admin/users | 用户列表 | 管理员 |
| GET | /api/admin/users/{id} | 用户详情 | 管理员 |
| PUT | /api/admin/users/{id} | 更新用户 | 管理员 |

## 关键设计决策
- 错误码前缀映射 HTTP 状态码（复用已有 ErrorCode 接口规范）
- bcrypt cost factor = 10
- JWT HS256 签名，过期时间通过环境变量配置
- 积分初始化降级处理（超时 3s，失败不影响注册）
- MyBatis-Plus 分页插件 + 自动填充 createdAt/updatedAt
