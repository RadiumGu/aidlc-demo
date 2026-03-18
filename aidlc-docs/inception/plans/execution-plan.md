# 执行计划

## 详细分析摘要

### 转换范围
- **转换类型**: 架构级 — 在已有微服务骨架上实现完整 MVP 业务逻辑
- **主要变更**: 5 个后端服务的业务实现 + 前端全面对接后端 API
- **受影响组件**: 全部 6 个组件（frontend, gateway, auth, product, points, order）

### 变更影响评估
- **用户界面变更**: 是 — 前端从 Mock 数据切换为真实 API
- **结构变更**: 否 — 保持现有 DDD 分层架构不变
- **数据模型变更**: 是 — 需新增 User、PointsAccount、PointsTransaction、Order、OrderItem 等领域模型
- **API 变更**: 是 — Auth/Points/Order 需新增全部业务 API
- **NFR 影响**: 是 — 分布式事务（积分+库存一致性）、角色权限控制

### 组件依赖关系
```
Frontend → Gateway → Auth Service（认证基础，必须先实现）
                  → Product Service（已部分实现，需补充）
                  → Points Service（依赖 Auth 的用户体系）
                  → Order Service（依赖 Product + Points）
```

### 风险评估
- **风险等级**: 中等
- **回滚复杂度**: 中等（各服务独立，可逐服务回滚）
- **测试复杂度**: 中等（需跨服务集成测试，特别是兑换事务）

## 工作流可视化

```
用户需求
    |
    v
+-----------------------------------------------+
| 🔵 INCEPTION 阶段                              |
| [x] 工作空间检测          ✅ 已完成             |
| [x] 逆向工程              ✅ 已完成             |
| [x] 需求分析              ✅ 已完成             |
| [x] 用户故事              ✅ 已完成             |
| [x] 工作流规划            ⏳ 进行中             |
| [ ] 应用设计              🔶 执行               |
| [ ] 工作单元生成          🔶 执行               |
+-----------------------------------------------+
    |
    v
+-----------------------------------------------+
| 🟢 CONSTRUCTION 阶段（每单元循环）              |
| [ ] 功能设计              🔶 执行               |
| [ ] NFR 需求              🔶 执行               |
| [ ] NFR 设计              🔶 执行               |
| [ ] 基础设施设计          ⬜ 跳过               |
| [ ] 代码生成              ✅ 执行               |
| [ ] 构建与测试            ✅ 执行               |
+-----------------------------------------------+
    |
    v
+-----------------------------------------------+
| 🟡 OPERATIONS 阶段                             |
| [ ] 运维                  ⬜ 占位               |
+-----------------------------------------------+
    |
    v
  完成
```

## 阶段执行计划

### 🔵 INCEPTION 阶段
- [x] Workspace Detection — 已完成
- [x] Reverse Engineering — 已完成
- [x] Requirements Analysis — 已完成
- [x] User Stories — 已完成
- [x] Workflow Planning — 进行中
- [ ] Application Design — **执行**
  - **理由**: 需定义 Auth/Points/Order 的新组件方法和服务层设计，以及跨服务交互
- [ ] Units Generation — **执行**
  - **理由**: 系统涉及 6 个组件，需分解为可独立开发的工作单元

### 🟢 CONSTRUCTION 阶段（每工作单元）
- [ ] Functional Design — **执行**
  - **理由**: 新数据模型（User, PointsAccount, Order 等）和复杂业务逻辑（兑换事务）需详细设计
- [ ] NFR Requirements — **执行**
  - **理由**: 分布式事务一致性、JWT 安全认证、角色权限控制需专门评估
- [ ] NFR Design — **执行**
  - **理由**: NFR Requirements 会执行，需设计具体实现方案
- [ ] Infrastructure Design — **跳过**
  - **理由**: 使用现有基础设施（MySQL + Redis），无新增云资源需求，MVP 阶段本地/容器部署
- [ ] Code Generation — **执行**（必执行）
  - **理由**: 核心实现阶段
- [ ] Build and Test — **执行**（必执行）
  - **理由**: 构建验证和测试指令生成

### 🟡 OPERATIONS 阶段
- [ ] Operations — 占位（未来扩展）

## 工作单元更新顺序（建议）

| 顺序 | 工作单元 | 依赖 | 理由 |
|------|---------|------|------|
| 1 | Auth Service | 无 | 认证是所有其他服务的基础 |
| 2 | Product Service | Auth | 补充管理接口，需认证 |
| 3 | Points Service | Auth | 积分账户依赖用户体系 |
| 4 | Order Service | Auth + Product + Points | 兑换需调用积分和库存 |
| 5 | Gateway Service | Auth | 补充路由和权限配置 |
| 6 | Frontend | 全部后端 | 最后对接所有 API |

## 成功标准
- **主要目标**: 可运行的 AWSomeShop MVP
- **关键交付物**:
  - 完整的用户登录认证流程
  - 商品浏览、筛选、搜索、兑换全流程
  - 积分管理（查询、发放、扣除）
  - 订单管理（创建、状态流转）
  - 前端对接真实 API
- **质量门槛**:
  - 所有 API 可通过 Swagger 测试
  - 积分+库存分布式事务一致性保证
  - 角色权限正确隔离
