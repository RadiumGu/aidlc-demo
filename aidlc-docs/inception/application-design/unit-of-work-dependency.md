# 工作单元依赖矩阵

## 依赖关系图

```
Unit 1: Auth Service        (无依赖)
    |
    +---> Unit 2: Product Service  (需 Auth 角色体系)
    |
    +---> Unit 3: Points Service   (需 Auth 用户体系)
    |         |
    |         +---> Unit 4: Order Service  (需 Points + Product)
    |                   |
    +---> Unit 5: Gateway Service  (需 Auth Token/Role)
                        |
                        +---> Unit 6: Frontend  (需全部后端)
```

## 依赖矩阵

| 工作单元 ↓ 依赖 → | Unit 1 Auth | Unit 2 Product | Unit 3 Points | Unit 4 Order | Unit 5 Gateway |
|--------------------|-------------|----------------|---------------|--------------|----------------|
| **Unit 1: Auth** | — | — | — | — | — |
| **Unit 2: Product** | 角色权限 | — | — | — | — |
| **Unit 3: Points** | 用户体系 | — | — | — | — |
| **Unit 4: Order** | 用户体系 | 库存扣减/恢复 | 积分扣减/退还 | — | — |
| **Unit 5: Gateway** | Token+Role验证 | — | — | — | — |
| **Unit 6: Frontend** | 登录API | 商品API | 积分API | 订单API | 路由 |

## 开发顺序

| 阶段 | 工作单元 | 可并行 | 说明 |
|------|---------|--------|------|
| 阶段 1 | Unit 1: Auth Service | — | 基础依赖，必须先完成 |
| 阶段 2 | Unit 2: Product Service | ✅ 可与 Unit 3 并行 | 补充管理和内部接口 |
| 阶段 2 | Unit 3: Points Service | ✅ 可与 Unit 2 并行 | 积分全功能实现 |
| 阶段 3 | Unit 4: Order Service | — | 依赖 Unit 2 + Unit 3 的内部接口 |
| 阶段 3 | Unit 5: Gateway Service | ✅ 可与 Unit 4 并行 | 路由+权限配置 |
| 阶段 4 | Unit 6: Frontend | — | 最后对接所有 API |

## 集成测试检查点

| 检查点 | 时机 | 验证内容 |
|--------|------|---------|
| CP-1 | Unit 1 完成后 | 登录→获取 Token→Gateway 验证通过 |
| CP-2 | Unit 2+3 完成后 | 商品 CRUD + 积分发放/查询 |
| CP-3 | Unit 4 完成后 | 完整兑换流程：扣积分→扣库存→创建订单 |
| CP-4 | Unit 5 完成后 | 全部 API 通过 Gateway 可达，角色权限隔离 |
| CP-5 | Unit 6 完成后 | 前端完整流程端到端测试 |
