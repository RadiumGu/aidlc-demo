# 依赖关系

## 服务间依赖

```
+----------+     HTTP      +----------+
| Frontend |-------------->| Gateway  |
+----------+               +----+-----+
                                |
                   +------------+------------+
                   |            |            |
              WebClient    路由转发      路由转发
                   |            |            |
                   v            v            v
             +------+    +--------+    +-------+
             | Auth |    | Product|    | Points|
             +------+    +--------+    +-------+
                                            |
                              路由转发       |
                                |           |
                                v           |
                           +-------+        |
                           | Order |        |
                           +-------+        |
```

### Gateway Service → Auth Service
- **类型**: Runtime（HTTP WebClient）
- **原因**: 每个需要认证的请求，Gateway 调用 Auth Service 验证 JWT Token

### Frontend → Gateway Service
- **类型**: Runtime（HTTP Axios）
- **原因**: 所有前端 API 请求通过 Gateway 统一入口

### Gateway → Product/Points/Order Service
- **类型**: Runtime（路由转发）
- **原因**: Gateway 根据路径前缀将请求路由到对应后端服务

## 外部依赖

### 各后端服务共同依赖
| 依赖 | 类型 | 用途 |
|------|------|------|
| MySQL | Runtime | 数据持久化 |
| Redis | Runtime | 缓存 |
| Spring Boot Starter | Compile | 应用框架 |
| MyBatis-Plus | Compile | ORM |
| Druid | Compile | 连接池 |
| JJWT | Compile | JWT 处理 |
| Lombok | Compile | 代码生成 |
| Swagger/OpenAPI | Compile | API 文档 |

### Gateway Service 额外依赖
| 依赖 | 类型 | 用途 |
|------|------|------|
| Spring Cloud Gateway | Compile | 响应式网关 |
| Spring WebFlux | Compile | 响应式 Web |

### Frontend 依赖
| 依赖 | 类型 | 用途 |
|------|------|------|
| React | Compile | UI 框架 |
| MUI | Compile | UI 组件 |
| Axios | Compile | HTTP 客户端 |
| Zustand | Compile | 状态管理 |
| React Router | Compile | 路由 |
| i18next | Compile | 国际化 |
