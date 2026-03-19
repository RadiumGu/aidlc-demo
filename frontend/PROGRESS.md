# AWSomeShop 前端开发进度

> 基于 `awsome-shop-plan/doc/awsome-shop.pen` 设计稿对照，更新日期：2026-03-18

## 总览

- 设计稿总计：30 个页面/弹窗
- 已完成：20 个页面 + 2 个布局框架 + 7 个弹窗组件
- 未完成：1 个弹窗（编辑类目复用新增类目）
- 完成度：约 97%

## 技术栈

React 19 + TypeScript + Vite 7 + MUI 6 + Zustand + react-i18next + Axios

## 基础设施（已完成）

- [x] Vite + TypeScript 工程配置
- [x] MUI 主题系统（light/dark）
- [x] Axios 请求封装（JWT 拦截 + 401 处理）
- [x] Zustand 状态管理（useAuthStore + useAppStore，带 persist）
- [x] i18n 国际化（中/英双语）
- [x] 路由系统 + AuthGuard 权限守卫（employee/admin 角色区分）
- [x] Mock 用户登录（admin/admin123, employee/emp123）

## 员工端页面（9 个设计稿，完成 9 个）

| # | 设计稿名称 | 代码文件 | 状态 |
|---|-----------|---------|------|
| 1 | Employee - Login | `pages/Login/index.tsx` | ✅ 完成 |
| 2 | Employee - Shop Home | `pages/ShopHome/index.tsx` | ✅ 完成 |
| 3 | Employee - Product Detail | `pages/ProductDetail/index.tsx` | ✅ 完成 |
| 4 | Employee - Confirm Redemption | `pages/ConfirmRedemption/index.tsx` | ✅ 完成 |
| 5 | Employee - Delivery Info | `pages/DeliveryInfo/index.tsx` | ✅ 完成 |
| 6 | Employee - Redemption Success | `pages/RedemptionSuccess/index.tsx` | ✅ 完成 |
| 7 | Employee - Order Detail | `pages/OrderDetail/index.tsx` | ✅ 完成 |
| 8 | Employee - Redemption History | `pages/RedemptionHistory/index.tsx` | ✅ 完成 |
| 9 | Employee - Points Center | `pages/PointsCenter/index.tsx` | ✅ 完成 |

## 管理端页面（11 个设计稿，完成 11 个）

| # | 设计稿名称 | 代码文件 | 状态 |
|---|-----------|---------|------|
| 1 | Admin - Dashboard | `pages/Dashboard/index.tsx` | ✅ 完成 |
| 2 | Admin - Product Management | `pages/admin/ProductManagement/index.tsx` | ✅ 完成 |
| 3 | Admin - Product Detail | `pages/admin/AdminProductDetail/index.tsx` | ✅ 完成 |
| 4 | Admin - Edit Product | `pages/admin/EditProduct/index.tsx` | ✅ 完成 |
| 5 | Admin - Category Management | `pages/admin/CategoryManagement/index.tsx` | ✅ 完成 |
| 6 | Admin - Points Rule Management | `pages/admin/PointsRuleManagement/index.tsx` | ✅ 完成 |
| 7 | Admin - Exchange Records | `pages/admin/ExchangeRecords/index.tsx` | ✅ 完成 |
| 8 | Admin - Exchange Detail | `pages/admin/ExchangeDetail/index.tsx` | ✅ 完成 |
| 9 | Admin - User Management | `pages/admin/UserManagement/index.tsx` | ✅ 完成 |
| 10 | Admin - User Points History | `pages/admin/UserPointsHistory/index.tsx` | ✅ 完成 |
| 11 | Admin - Team | `pages/admin/Team/index.tsx` | ✅ 完成 |

## 弹窗/对话框（10 个设计稿，完成 10 个）

| # | 设计稿名称 | 代码文件 | 状态 |
|---|-----------|---------|------|
| 1 | Dialog - 下架确认 | `components/dialogs/ConfirmRemoveDialog.tsx` | ✅ 完成 |
| 2 | Dialog - 调整库存 | `components/dialogs/AdjustStockDialog.tsx` | ✅ 完成 |
| 3 | Dialog - 上传图片 | `components/dialogs/UploadImageDialog.tsx` | ✅ 完成 |
| 4 | Dialog - 新增类目 | `pages/admin/CategoryManagement/index.tsx` (内联) | ✅ 完成 |
| 5 | Dialog - 编辑类目 | 复用新增类目弹窗（mode 参数切换） | ✅ 完成 |
| 6 | Dialog - 删除类目确认 | `components/dialogs/DeleteCategoryDialog.tsx` | ✅ 完成 |
| 7 | Dialog - 新增规则 | `components/dialogs/AddEditRuleDialog.tsx` | ✅ 完成 |
| 8 | Dialog - 编辑规则 | `components/dialogs/AddEditRuleDialog.tsx` (mode='edit') | ✅ 完成 |
| 9 | Dialog - 修改发货状态 | `components/dialogs/UpdateShippingDialog.tsx` | ✅ 完成 |
| 10 | Dialog - 调整用户积分 | `components/dialogs/AdjustUserPointsDialog.tsx` | ✅ 完成 |

## 布局组件（已完成）

| 组件 | 文件 | 状态 |
|------|------|------|
| 员工端布局（顶部导航栏） | `components/Layout/EmployeeLayout.tsx` | ✅ |
| 管理端布局（左侧深色侧边栏） | `components/Layout/AdminLayout.tsx` | ✅ |
| 头像下拉菜单 | `components/AvatarMenu.tsx` | ✅ |

## 待完成事项

- [ ] 后端 API 对接（目前全部使用 mock 数据）
