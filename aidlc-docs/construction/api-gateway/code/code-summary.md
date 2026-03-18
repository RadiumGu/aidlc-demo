# Unit 6: api-gateway — 代码摘要

## 生成文件清单

### api-gateway-api 模块（DTO、模型）
| 文件 | 说明 |
|------|------|
| `common/Result.java` | 统一响应格式 { code, message, data } |
| `model/GatewayErrorCode.java` | 网关错误码枚举（GW_001~GW_005） |
| `model/UserInfo.java` | 用户信息模型（userId, username, role） |

### api-gateway-app 模块（实现、启动）
| 文件 | 说明 |
|------|------|
| `config/RouteConfig.java` | 路由配置，12 条规则按优先级排序 |
| `config/AccessRuleConfig.java` | 权限规则配置，三级权限控制 |
| `config/RestTemplateConfig.java` | RestTemplate 配置，超时设置 |
| `filter/AuthenticationFilter.java` | JWT 认证过滤器（@Order(1)） |
| `filter/AuthorizationFilter.java` | 授权过滤器（@Order(2)） |
| `controller/GatewayController.java` | 网关控制器，路由+转发+错误处理 |
| `handler/GlobalExceptionHandler.java` | 全局异常处理 |
| `GatewayApplication.java` | 启动类，含 JWT_SECRET 校验 |
| `resources/application.yml` | 本地开发配置 |
| `resources/application-docker.yml` | Docker 环境配置 |

### 构建文件
| 文件 | 说明 |
|------|------|
| `pom.xml` | 父 POM |
| `api-gateway-api/pom.xml` | API 模块 POM |
| `api-gateway-app/pom.xml` | APP 模块 POM |
| `Dockerfile` | 多阶段构建（Maven + JRE 21） |

## 关键设计决策
1. 使用 Spring Boot Web + Servlet Filter 链实现网关，而非 Spring Cloud Gateway
2. 认证/授权分离为两个 Filter（@Order(1) 认证 → @Order(2) 授权）
3. 请求转发使用 RestTemplate + @RequestMapping("/api/**") Controller 方式
4. JWT 校验使用 jjwt 库（与 auth-service 一致）
5. 无数据库依赖，纯无状态服务

## 路由规则（12 条）
| URL 前缀 | 目标服务 | 优先级 |
|---------|---------|--------|
| /api/auth | auth-service:8001 | 100 |
| /api/admin/users | auth-service:8001 | 90 |
| /api/admin/products | product-service:8002 | 90 |
| /api/admin/categories | product-service:8002 | 90 |
| /api/admin/points | points-service:8003 | 90 |
| /api/admin/orders | order-service:8004 | 90 |
| /api/users | auth-service:8001 | 80 |
| /api/products | product-service:8002 | 80 |
| /api/categories | product-service:8002 | 80 |
| /api/files | product-service:8002 | 80 |
| /api/points | points-service:8003 | 80 |
| /api/orders | order-service:8004 | 80 |

## 错误码清单
| 错误码 | HTTP 状态码 | 消息 |
|--------|------------|------|
| GW_001 | 401 | 未授权，请先登录 |
| GW_002 | 403 | 权限不足 |
| GW_003 | 502 | 服务暂时不可用 |
| GW_004 | 504 | 请求超时 |
| GW_005 | 404 | 资源不存在 |
