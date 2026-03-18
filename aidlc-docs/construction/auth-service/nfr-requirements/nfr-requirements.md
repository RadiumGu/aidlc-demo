# Auth Service — 非功能需求

## 性能需求

| ID | 需求 | 指标 | 说明 |
|----|------|------|------|
| NFR-AUTH-P01 | 登录接口响应时间 | P95 < 500ms | 含密码 BCrypt 验证耗时 |
| NFR-AUTH-P02 | Token 验证接口响应时间 | P95 < 100ms | 每个请求都会调用，需快速 |
| NFR-AUTH-P03 | 并发登录支持 | 50 TPS | < 100 人同时在线，峰值场景 |

## 安全需求

| ID | 需求 | 实现方案 |
|----|------|---------|
| NFR-AUTH-S01 | 密码加密存储 | BCrypt，强度因子 10 |
| NFR-AUTH-S02 | JWT Token 签名 | HMAC-SHA256，密钥从配置/环境变量读取 |
| NFR-AUTH-S03 | Token 失效机制 | Redis 黑名单，退出登录后立即失效 |
| NFR-AUTH-S04 | 防暴力破解 | 5 次失败锁定 30 分钟 |
| NFR-AUTH-S05 | 敏感信息保护 | 密码不在日志和响应中出现 |
| NFR-AUTH-S06 | Token 传输安全 | Authorization: Bearer 头传输 |
| NFR-AUTH-S07 | 错误信息模糊化 | 登录失败不区分"用户不存在"和"密码错误" |

## 可用性需求

| ID | 需求 | 说明 |
|----|------|------|
| NFR-AUTH-A01 | 服务可用性 | 99.9%（MVP 阶段不做高可用集群） |
| NFR-AUTH-A02 | Redis 故障降级 | Redis 不可用时，Token 黑名单检查跳过（允许短时间内已退出 Token 仍有效） |
| NFR-AUTH-A03 | 数据库故障 | 连接池重试机制（Druid 已有） |

## 可维护性需求

| ID | 需求 | 说明 |
|----|------|------|
| NFR-AUTH-M01 | 数据库迁移 | Flyway 管理 Schema 变更 |
| NFR-AUTH-M02 | 配置外部化 | JWT 密钥、Token 有效期、锁定参数均可通过配置修改 |
| NFR-AUTH-M03 | API 文档 | Swagger/OpenAPI 自动生成 |
| NFR-AUTH-M04 | 结构化日志 | JSON 格式日志，含 requestId、operatorId |
| NFR-AUTH-M05 | 健康检查 | Spring Actuator `/actuator/health` |

## 可观测性需求

| ID | 需求 | 说明 |
|----|------|------|
| NFR-AUTH-O01 | 指标暴露 | Prometheus metrics（登录成功/失败计数、Token 验证延迟） |
| NFR-AUTH-O02 | 分布式追踪 | Micrometer Tracing（已配置） |
| NFR-AUTH-O03 | 审计日志 | 登录成功/失败、退出登录事件记录到审计日志 |
