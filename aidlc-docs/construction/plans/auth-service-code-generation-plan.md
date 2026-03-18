# Auth Service — 代码生成计划

## 单元上下文

- **工作单元**: Unit 1: Auth Service
- **代码位置**: `/home/ubuntu/tech/aidlc-demo/auth-service/`
- **项目类型**: Brownfield（已有 DDD 分层骨架）
- **关联用户故事**: US-01(登录), US-02(退出), US-11(管理员登录)

## 已有文件（需保留/修改）
- 骨架 DDD 模块结构（application/domain/infrastructure/interface/bootstrap/common）
- Test 示例代码（将被替换为实际业务代码）
- pom.xml（已有依赖，可能需微调）
- application*.yml 配置文件（需新增安全配置）

## 执行步骤

### 阶段 A: 领域层

- [ ] Step 1: 创建 UserEntity 领域实体 + UserRole/UserStatus 枚举
  - `domain/domain-model/src/.../domain/model/user/UserEntity.java`
  - `domain/domain-model/src/.../domain/model/user/UserRole.java`
  - `domain/domain-model/src/.../domain/model/user/UserStatus.java`

- [ ] Step 2: 创建领域服务接口
  - `domain/domain-api/src/.../domain/service/auth/AuthDomainService.java`
  - `domain/domain-api/src/.../domain/service/auth/JwtTokenService.java`
  - `domain/repository-api/src/.../repository/user/UserRepository.java`

- [ ] Step 3: 创建领域服务实现
  - `domain/domain-impl/src/.../domain/impl/service/auth/AuthDomainServiceImpl.java`

### 阶段 B: 应用层

- [ ] Step 4: 创建 DTO（请求/响应）
  - `application/application-api/src/.../application/api/dto/auth/LoginRequest.java`
  - `application/application-api/src/.../application/api/dto/auth/AuthResponse.java`
  - `application/application-api/src/.../application/api/dto/auth/UserDTO.java`
  - `application/application-api/src/.../application/api/dto/auth/AuthValidateRequest.java`
  - `application/application-api/src/.../application/api/dto/auth/AuthValidateResponse.java`
  - `application/application-api/src/.../application/api/dto/auth/RefreshTokenRequest.java`

- [ ] Step 5: 创建应用服务接口和实现
  - `application/application-api/src/.../application/api/service/auth/AuthApplicationService.java`
  - `application/application-impl/src/.../application/impl/service/auth/AuthApplicationServiceImpl.java`

### 阶段 C: 基础设施层

- [ ] Step 6: 创建 JWT 实现
  - `infrastructure/security/jwt-impl/src/.../infrastructure/security/jwt/JwtTokenServiceImpl.java`

- [ ] Step 7: 创建 Redis Token 黑名单
  - `infrastructure/cache/redis-impl/src/.../infrastructure/cache/redis/TokenBlacklistService.java`

- [ ] Step 8: 创建 MySQL 仓储实现
  - `infrastructure/repository/mysql-impl/src/.../repository/mysql/po/user/UserPO.java`
  - `infrastructure/repository/mysql-impl/src/.../repository/mysql/mapper/user/UserMapper.java`
  - `infrastructure/repository/mysql-impl/src/.../repository/mysql/impl/user/UserRepositoryImpl.java`

- [ ] Step 9: 创建 BCrypt 和安全配置
  - `bootstrap/src/.../bootstrap/config/SecurityProperties.java`
  - `bootstrap/src/.../bootstrap/config/BCryptConfig.java`

### 阶段 D: 接口层

- [ ] Step 10: 创建 REST Controller
  - `interface/interface-http/src/.../facade/http/controller/AuthController.java`
  - `interface/interface-http/src/.../facade/http/controller/InternalAuthController.java`

### 阶段 E: 配置与数据库迁移

- [ ] Step 11: 更新 application 配置
  - 修改 `bootstrap/src/main/resources/application.yml` — 添加安全配置
  - 修改 `bootstrap/src/main/resources/application-local.yml` — 本地环境配置

- [ ] Step 12: 创建 Flyway 数据库迁移
  - `bootstrap/src/main/resources/db/migration/V1__create_user_table.sql`
  - `bootstrap/src/main/resources/db/migration/V2__init_seed_data.sql`

### 阶段 F: 清理

- [ ] Step 13: 清理 Test 脚手架代码（可选，保留不影响功能）

---

**总计**: 13 个步骤，约 20+ 个 Java 文件新增/修改，2 个 SQL 迁移文件，2 个配置文件修改

**执行方式**: 使用 kiro-cli 编码代理自动生成，基于上述设计文档和已有代码结构
