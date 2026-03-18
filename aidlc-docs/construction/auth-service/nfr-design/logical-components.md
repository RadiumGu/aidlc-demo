# Auth Service — 逻辑组件

## 组件架构图

```
+---------------------------------------------------------------+
| Auth Service                                                   |
|                                                                |
| +------------------+    +------------------+                   |
| | Interface Layer  |    | Bootstrap        |                   |
| | AuthController   |    | Application.java |                   |
| | (REST API)       |    | SecurityConfig   |                   |
| +--------+---------+    +------------------+                   |
|          |                                                     |
| +--------v---------+                                           |
| | Application Layer|                                           |
| | AuthAppService   |                                           |
| +--------+---------+                                           |
|          |                                                     |
| +--------v-------------------+                                 |
| | Domain Layer               |                                 |
| | UserEntity                 |                                 |
| | AuthDomainService          |                                 |
| | JwtTokenService (接口)     |                                 |
| | UserRepository (接口)      |                                 |
| +--------+------------------+                                  |
|          |                                                     |
| +--------v---------------------------------------------------+ |
| | Infrastructure Layer                                       | |
| |                                                            | |
| | +------------------+ +------------------+ +-------------+  | |
| | | MySQL (Repo实现) | | Redis (黑名单)   | | JWT (JJWT)  |  | |
| | | UserRepoImpl     | | TokenBlacklistSvc| | JwtTokenImpl|  | |
| | | UserMapper       | |                  | |             |  | |
| | | UserPO           | |                  | |             |  | |
| | +------------------+ +------------------+ +-------------+  | |
| +------------------------------------------------------------+ |
+---------------------------------------------------------------+
```

## 逻辑组件清单

### 1. Interface Layer（接口层）

| 组件 | 类 | 职责 |
|------|-----|------|
| AuthController | `facade.http.controller.AuthController` | REST API 入口 |
| InternalAuthController | `facade.http.controller.InternalAuthController` | 内部 Token 验证接口 |

### 2. Application Layer（应用层）

| 组件 | 类 | 职责 |
|------|-----|------|
| AuthApplicationService | `application.api.service.auth.AuthApplicationService` | 认证应用服务接口 |
| AuthApplicationServiceImpl | `application.impl.service.auth.AuthApplicationServiceImpl` | 认证应用服务实现，编排登录/退出/刷新流程 |

### 3. Domain Layer（领域层）

| 组件 | 类 | 职责 |
|------|-----|------|
| UserEntity | `domain.model.user.UserEntity` | 用户领域实体 |
| UserRole (Enum) | `domain.model.user.UserRole` | 角色枚举 (ADMIN/EMPLOYEE) |
| UserStatus (Enum) | `domain.model.user.UserStatus` | 状态枚举 (ACTIVE/DISABLED) |
| AuthDomainService | `domain.service.auth.AuthDomainService` | 认证领域服务接口 |
| AuthDomainServiceImpl | `domain.impl.service.auth.AuthDomainServiceImpl` | 认证领域服务实现 |
| JwtTokenService | `domain.service.auth.JwtTokenService` | JWT 服务接口（签发/验证/失效） |
| UserRepository | `repository.user.UserRepository` | 用户仓储接口 |

### 4. Infrastructure Layer（基础设施层）

| 组件 | 类 | 职责 |
|------|-----|------|
| JwtTokenServiceImpl | `infrastructure.security.jwt.JwtTokenServiceImpl` | JJWT 实现 JWT 签发/验证 |
| TokenBlacklistService | `infrastructure.cache.redis.TokenBlacklistService` | Redis Token 黑名单管理 |
| UserRepositoryImpl | `repository.mysql.impl.user.UserRepositoryImpl` | MyBatis-Plus 用户仓储实现 |
| UserMapper | `repository.mysql.mapper.user.UserMapper` | MyBatis-Plus Mapper |
| UserPO | `repository.mysql.po.user.UserPO` | 持久化对象 |
| BCryptConfig | `bootstrap.config.BCryptConfig` | BCryptPasswordEncoder Bean 配置 |
| SecurityProperties | `bootstrap.config.SecurityProperties` | JWT/Login 安全配置属性 |

### 5. DTO（数据传输对象）

| 组件 | 位置 | 用途 |
|------|------|------|
| LoginRequest | application-api | 登录请求 |
| AuthResponse | application-api | 登录/刷新响应（含 Token + 用户信息） |
| UserDTO | application-api | 用户信息 |
| AuthValidateRequest | application-api | Token 验证请求 |
| AuthValidateResponse | application-api | Token 验证响应（含 role） |
| RefreshTokenRequest | application-api | Token 刷新请求 |

## Flyway 迁移文件

| 文件 | 内容 |
|------|------|
| `V1__create_user_table.sql` | 创建 t_user 表 |
| `V2__init_seed_data.sql` | 初始管理员 + 测试员工数据 |
