# 组件清单

## 应用包

| 组件 | 语言/框架 | 模块数 | Java文件数 | 职责 |
|------|----------|--------|-----------|------|
| frontend | React/TypeScript | 1 | — (21 TS) | 前端 SPA |
| gateway-service | Spring Cloud Gateway | 6 | 61 | API 网关 |
| auth-service | Spring Boot | 6 | 42 | 用户认证 |
| product-service | Spring Boot | 6 | 55 | 商品管理 |
| points-service | Spring Boot | 6 | 42 | 积分管理 |
| order-service | Spring Boot | 6 | 42 | 订单管理 |

## 设计稿包

| 组件 | 职责 |
|------|------|
| plan | 产品设计文档、需求文档 |

## 总计

- **总组件数**: 7（6个应用 + 1个设计稿）
- **应用组件**: 6
- **基础设施组件**: 0（无独立 IaC 包）
- **共享组件**: 0（各服务独立，暂无共享库）
- **测试组件**: 各服务内置（TestContainers 集成测试配置就绪）
