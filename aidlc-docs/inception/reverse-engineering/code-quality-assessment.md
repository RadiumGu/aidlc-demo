# 代码质量评估

## 测试覆盖

- **整体**: 低 — 目前仅有 TestContainers 配置，无实际测试用例
- **单元测试**: 无
- **集成测试**: 测试配置文件就绪（application-test.yml），但无测试代码
- **前端测试**: 无

## 代码质量指标

| 指标 | 评级 | 说明 |
|------|------|------|
| **代码规范** | ✅ 良好 | DDD 分层统一，命名规范一致 |
| **项目结构** | ✅ 良好 | 各服务结构标准化，模块划分清晰 |
| **配置管理** | ✅ 良好 | 多环境配置（local/dev/test），敏感信息使用环境变量 |
| **异常处理** | ✅ 良好 | 统一异常体系，自定义错误码枚举 |
| **API 文档** | ✅ 良好 | Swagger/OpenAPI 已配置 |
| **日志** | ✅ 良好 | 结构化 JSON 日志，审计日志分离 |
| **国际化** | ✅ 良好 | 前端中英文支持 |
| **Lint** | ✅ 已配置 | 前端 ESLint |
| **文档** | ⚠️ 一般 | 代码注释较少，README 基础 |
| **测试** | ❌ 缺失 | 无实际测试用例 |

## 技术债务

| 问题 | 位置 | 严重度 |
|------|------|--------|
| Mock 登录数据硬编码 | frontend/src/store/useAuthStore.ts | 中 — 需要对接后端认证 |
| 商品创建接口标记为 public | product-service/ProductController.java | 中 — 生产环境应需要管理员权限 |
| Test 脚手架代码未清理 | 所有后端服务 | 低 — 占位代码，开发时替换 |
| AWS SDK 已声明未使用 | gateway-service pom.xml | 低 — 预留依赖 |
| 无服务发现机制 | gateway application-local.yml | 低 — 硬编码服务地址，MVP 阶段可接受 |

## 良好模式

| 模式 | 说明 |
|------|------|
| DDD 分层架构 | 所有服务统一的 6 层模块结构 |
| 领域-基础设施分离 | Repository 接口在 domain 层，实现在 infrastructure 层 |
| 统一异常处理 | 全局异常处理器 + 错误码枚举 |
| 响应式网关 | Gateway 使用 WebFlux 响应式编程 |
| 多环境配置 | Spring Profiles 管理 local/dev/test 环境 |
| 请求追踪 | Micrometer Tracing + X-Request-Id 注入 |
| 操作者追踪 | X-Operator-Id 头注入下游服务 |

## 反模式

| 问题 | 位置 | 说明 |
|------|------|------|
| 无共享模块 | 各服务间 | common 模块每个服务重复，可抽取共享 |
