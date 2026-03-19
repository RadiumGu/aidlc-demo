# Unit 1: Frontend 代码生成计划

## 概述
将前端从 Mock 数据模式重构为真实 API 集成模式，补齐缺失页面，清理多余页面。

## 步骤

### Step 1: API 服务层 — 类型定义 + API 函数
- 创建 `src/types/api.ts` — 所有 API 请求/响应类型（对齐后端 DTO）
- 创建 `src/services/auth.ts` — 认证 API（register, login, logout）
- 创建 `src/services/product.ts` — 产品 API（list, detail, categories）
- 创建 `src/services/points.ts` — 积分 API（balance, transactions）
- 创建 `src/services/order.ts` — 兑换 API（create, list, detail）
- 创建 `src/services/admin.ts` — 管理端 API（products, categories, points, orders, users）
- 增强 `src/services/request.ts` — 完善错误处理、Toast 提示

### Step 2: 状态管理重构
- 重写 `src/store/useAuthStore.ts` — 替换 Mock 为真实 API，存储 token + user
- 创建 `src/store/useProductStore.ts` — 产品列表、分类、搜索状态
- 创建 `src/store/usePointsStore.ts` — 积分余额、变动历史
- 创建 `src/store/useOrderStore.ts` — 兑换记录

### Step 3: 路由重构 + 缺失页面
- 创建 `src/pages/Register/index.tsx` — 注册页
- 创建 `src/pages/admin/NewProduct/index.tsx` — 新增产品页
- 创建 `src/pages/admin/PointsConfig/index.tsx` — 积分配置页
- 更新 `src/router/index.tsx` — 添加新路由，移除 Team/DeliveryInfo
- 更新 `src/router/AuthGuard.tsx` — 适配新 AuthState

### Step 4: 员工端页面重构
- 重写 Login — 对接真实 login API
- 重写 ShopHome — 对接产品列表 + 分类筛选 + 搜索
- 重写 ProductDetail — 对接产品详情 API
- 重写 ConfirmRedemption — 对接兑换确认流程
- 重写 RedemptionHistory — 对接兑换历史 API
- 重写 OrderDetail — 对接订单详情 API
- 重写 PointsCenter — 对接积分余额 + 变动历史 API

### Step 5: 管理端页面重构
- 重写 Dashboard — 保留 UI，后续可对接统计 API
- 重写 ProductManagement — 对接管理端产品列表 API
- 重写 EditProduct — 对接产品编辑/新增 API
- 重写 CategoryManagement — 对接分类管理 API
- 重写 PointsRuleManagement — 重构为积分管理（员工积分列表 + 调整）
- 重写 ExchangeRecords — 对接管理端兑换记录 API
- 重写 UserManagement — 对接用户管理 API

### Step 6: 布局组件更新 + 清理
- 更新 AdminLayout — 移除 Team 导航项，添加积分配置
- 更新 EmployeeLayout — 对接真实积分余额
- 更新 AvatarMenu — 适配新 AuthState
- 删除多余页面/组件（Team, DeliveryInfo, RedemptionSuccess 等）
- 更新 Vite 配置 — 添加 API 代理

### Step 7: 构建验证
- 运行 `npm run build` 验证编译通过
