# 技术栈

## 编程语言

| 语言 | 版本 | 用途 |
|------|------|------|
| Java | 21 | 后端微服务 |
| TypeScript | 5.9 | 前端 SPA |

## 框架

| 框架 | 版本 | 用途 |
|------|------|------|
| Spring Boot | 3.5.10 | 后端应用框架 |
| Spring Cloud | 2025.0.0 | 微服务基础设施 |
| Spring Cloud Gateway | — | API 网关（Reactive） |
| MyBatis-Plus | 3.5.7 | ORM / 数据访问 |
| React | 19.2.0 | 前端 UI 框架 |
| MUI (Material UI) | 6.5.0 | UI 组件库 |
| Zustand | 5.0.11 | 前端状态管理 |
| React Router | 7.13.0 | 前端路由 |
| i18next | 25.8.4 | 国际化 |

## 基础设施

| 服务 | 用途 |
|------|------|
| MySQL | 关系型数据库（每服务独立） |
| Redis | 缓存 |
| Flyway | 数据库版本迁移 |

## 构建工具

| 工具 | 版本 | 用途 |
|------|------|------|
| Maven | — | 后端构建 |
| npm | — | 前端依赖管理 |
| Vite | 7.3.1 | 前端打包构建 |
| TypeScript Compiler | 5.9.3 | 前端类型检查 |

## 安全

| 组件 | 版本 | 用途 |
|------|------|------|
| JJWT | 0.12.6 | JWT 令牌签发与验证 |
| AES 加密 | — | 数据加密（自定义实现） |

## 可观测性

| 组件 | 版本 | 用途 |
|------|------|------|
| Micrometer Tracing | 1.3.5 | 分布式追踪 |
| Prometheus Metrics | — | 指标暴露 |
| Logstash Logback Encoder | 7.4 | JSON 格式日志 |

## 数据库连接

| 组件 | 版本 | 用途 |
|------|------|------|
| Druid | 1.2.20 | 数据库连接池 |
| Lettuce | — | Redis 客户端 |

## 测试

| 组件 | 用途 |
|------|------|
| TestContainers | 集成测试（MySQL/Redis 容器） |
| JUnit 5 | 单元测试 |
| ESLint | 前端代码检查 |

## 预留

| 组件 | 版本 | 用途 |
|------|------|------|
| AWS SDK | 2.20.0 | AWS 服务接入（pom 已声明，代码中未使用） |
