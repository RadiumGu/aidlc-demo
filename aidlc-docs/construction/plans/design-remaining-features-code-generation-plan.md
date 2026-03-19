# 设计稿遗留功能代码生成计划

## 概述
补全 Pencil 设计稿中尚未实现的 3 项功能，使前端实现与设计稿 100% 对齐。

## 遗留项清单

| # | 功能 | 涉及范围 | 后端变更 |
|---|------|---------|---------|
| 1 | 图片上传对话框 | EditProduct + NewProduct 页面 | 无（API 已存在） |
| 2 | 商品上架/下架状态切换 | AdminProductDetail 页面 + UpdateProductRequest | 需添加 status 字段 |
| 3 | Dashboard 统计数据 | Dashboard 页面 + 后端统计 API | 需新增统计 API |

---

## Step 1: 图片上传组件 — 创建通用 ImageUpload 组件
- [ ] 创建 `frontend/src/components/ImageUpload/index.tsx`
- [ ] 功能：点击选择图片 → 调用 `adminApi.uploadFile()` → 返回 URL
- [ ] 支持预览已上传图片、替换图片
- [ ] 添加 `data-testid` 属性

## Step 2: EditProduct 页面 — 集成图片上传
- [ ] 修改 `frontend/src/pages/admin/EditProduct/index.tsx`
- [ ] 在表单中添加图片上传区域（使用 ImageUpload 组件）
- [ ] 加载时显示已有图片 URL
- [ ] 保存时将 imageUrl 传入 `adminApi.updateProduct()`

## Step 3: NewProduct 页面 — 集成图片上传
- [ ] 修改 `frontend/src/pages/admin/NewProduct/index.tsx`
- [ ] 在表单中添加图片上传区域（使用 ImageUpload 组件）
- [ ] 创建时将 imageUrl 传入 `adminApi.createProduct()`

## Step 4: 后端 — UpdateProductRequest 添加 status 字段
- [ ] 修改 `product-service/product-service-api/src/main/java/com/awsome/shop/product/dto/UpdateProductRequest.java`
- [ ] 添加 `private String status;` 字段
- [ ] 修改 `ProductService.updateProduct()` 支持 status 更新

## Step 5: AdminProductDetail — 上架/下架状态切换
- [ ] 修改 `frontend/src/pages/admin/AdminProductDetail/index.tsx`
- [ ] 将"删除"按钮替换为"下架"/"上架"按钮（根据当前 status 动态切换）
- [ ] 下架确认对话框：调用 `adminApi.updateProduct(id, { status: 'INACTIVE' })`
- [ ] 上架操作：调用 `adminApi.updateProduct(id, { status: 'ACTIVE' })`
- [ ] 保留删除按钮（仅 INACTIVE 状态可删除）

## Step 6: 后端 — Dashboard 统计 API
- [ ] 在各微服务添加内部统计端点：
  - `product-service`: `GET /api/internal/products/stats` → 返回总产品数、本月新增数
  - `auth-service`: `GET /api/internal/users/stats` → 返回总用户数、本月新增数
  - `order-service`: `GET /api/internal/orders/stats` → 返回本月兑换数、较上月变化
  - `points-service`: `GET /api/internal/points/stats` → 返回本月积分发放总量
- [ ] 在 `api-gateway` 添加 `GET /api/admin/dashboard/stats` 聚合端点
- [ ] 聚合调用 4 个内部统计端点，返回 Dashboard 所需全部指标

## Step 7: 前端 — Dashboard 对接真实统计 API
- [ ] 在 `frontend/src/services/admin.ts` 添加 `getDashboardStats()` 函数
- [ ] 修改 `frontend/src/pages/Dashboard/index.tsx`
- [ ] 替换硬编码 Mock 数据为真实 API 调用
- [ ] 最近兑换表格对接 `adminApi.getOrders()` 获取最新 5 条记录

## Step 8: 构建验证
- [ ] `npm run build` 前端构建通过
- [ ] `product-service mvn package` 通过
- [ ] `auth-service mvn package` 通过
- [ ] `order-service mvn package` 通过
- [ ] `points-service mvn package` 通过
- [ ] `api-gateway mvn package` 通过

## Step 9: 代码摘要
- [ ] 创建 `aidlc-docs/construction/design-remaining-features/code/code-summary.md`
