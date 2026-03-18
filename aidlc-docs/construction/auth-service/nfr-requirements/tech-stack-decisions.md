# Auth Service — 技术栈决策

## 决策总览

Auth Service 沿用项目已有技术栈，不引入新框架，保持一致性。

## 技术选型

### 框架层

| 领域 | 选型 | 版本 | 理由 |
|------|------|------|------|
| 应用框架 | Spring Boot | 3.5.10 | 项目已有，保持统一 |
| Web 框架 | Spring MVC | — | 同步阻塞模型，Auth 服务不需响应式 |
| 依赖注入 | Spring IoC | — | 项目标准 |

### 安全层

| 领域 | 选型 | 版本 | 理由 |
|------|------|------|------|
| JWT 库 | JJWT | 0.12.6 | 项目已引入，成熟稳定 |
| 密码加密 | Spring Security BCryptPasswordEncoder | — | Spring 原生支持，工业标准 |
| Token 黑名单 | Redis (Lettuce) | — | 项目已有 Redis 配置，适合 TTL 管理 |

### 持久化层

| 领域 | 选型 | 版本 | 理由 |
|------|------|------|------|
| ORM | MyBatis-Plus | 3.5.7 | 项目已有，保持统一 |
| 数据库 | MySQL | — | 项目标准 |
| 连接池 | Druid | 1.2.20 | 项目已有 |
| 数据库迁移 | Flyway | — | 项目已配置 |

### 缓存层

| 领域 | 选型 | 理由 |
|------|------|------|
| Token 黑名单 | Redis String + TTL | 简单高效，自动过期 |
| 用户信息缓存 | 暂不缓存（MVP） | 小规模场景，直接查库即可 |

## 不引入的技术（及理由）

| 技术 | 排除理由 |
|------|---------|
| Spring Security 完整框架 | MVP 阶段过重，自定义 JWT 过滤器即可 |
| OAuth2 / OIDC | 需求明确为用户名密码登录，无需第三方认证 |
| Session 机制 | 使用无状态 JWT，不需要服务端 Session |
| 分布式锁 | 登录失败计数通过数据库乐观锁/行锁即可 |

## 配置参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `security.jwt.secret` | 配置文件/环境变量 | JWT 签名密钥（>= 256 bits） |
| `security.jwt.expiration` | 7200 (秒) | Access Token 有效期 |
| `security.jwt.refresh-expiration` | 604800 (秒) | Refresh Token 有效期 |
| `security.jwt.issuer` | awsome-shop-auth-service | Token 发行者 |
| `security.login.max-failed-attempts` | 5 | 最大失败次数 |
| `security.login.lock-duration` | 1800 (秒) | 锁定时长 |
