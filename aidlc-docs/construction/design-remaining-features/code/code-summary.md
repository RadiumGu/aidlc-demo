# 设计稿遗留功能 — 代码生成摘要

## 概述
补全 Pencil 设计稿中 3 项遗留功能，使前端实现与设计稿 100% 对齐。

## 变更清单

### 功能 1: 图片上传
| 文件 | 变更 |
|------|------|
| `frontend/src/components/ImageUpload/index.tsx` | 新建通用图片上传组件，支持预览/替换/删除 |
| `frontend/src/pages/admin/EditProduct/index.tsx` | 集成 ImageUpload，加载已有图片，保存时传 imageUrl |
| `frontend/src/pages/admin/NewProduct/index.tsx` | 集成 ImageUpload，创建时传 imageUrl |

### 功能 2: 商品上架/下架
| 文件 | 变更 |
|------|------|
| `product-service/.../UpdateProductRequest.java` | 添加 `status` 字段 |
| `product-service/.../ProductService.java` | updateProduct 支持 status 更新 |
| `frontend/src/types/api.ts` | UpdateProductRequest 添加 `status` 字段 |
| `frontend/src/pages/admin/AdminProductDetail/index.tsx` | 上架/下架切换按钮 + 确认对话框，INACTIVE 才显示删除 |

### 功能 3: Dashboard 统计数据
| 文件 | 变更 |
|------|------|
| `product-service/.../StatsResponse.java` | 新建 DTO (total, monthNew) |
| `product-service/.../AdminProductController.java` | 添加 `GET /stats` 端点 |
| `product-service/.../ProductService.java` | 添加 getStats() |
| `auth-service/.../StatsResponse.java` | 新建 DTO (total, monthNew) |
| `auth-service/.../UserRepository.java` | 添加 countAll(), countCreatedSince() |
| `auth-service/.../UserRepositoryImpl.java` | 实现计数方法 |
| `auth-service/.../UserService.java` | 添加 countAll(), countCreatedSince() |
| `auth-service/.../UserServiceImpl.java` | 实现计数方法 |
| `auth-service/.../AuthAppService.java` | 添加 getStats() |
| `auth-service/.../AuthAppServiceImpl.java` | 实现 getStats() |
| `auth-service/.../AdminUserController.java` | 添加 `GET /stats` 端点 |
| `order-service/.../StatsResponse.java` | 新建 DTO (monthOrders, lastMonthOrders) |
| `order-service/.../OrderService.java` | 添加 getStats() |
| `order-service/.../AdminOrderController.java` | 添加 `GET /stats` 端点 |
| `points-service/.../StatsResponse.java` | 新建 DTO (monthDistributed) |
| `points-service/.../PointsService.java` | 添加 getStats() |
| `points-service/.../AdminPointsController.java` | 添加 `GET /stats` 端点 |
| `frontend/src/services/admin.ts` | 添加 4 个 stats API 调用 |
| `frontend/src/pages/Dashboard/index.tsx` | 替换 mock 数据为真实 API，最近兑换表格对接真实订单 |

## 构建验证
- ✅ `npm run build` 通过
- ✅ product-service `mvn package` 通过
- ✅ auth-service `mvn package` 通过
- ✅ order-service `mvn package` 通过
- ✅ points-service `mvn package` 通过
- ✅ api-gateway `mvn package` 通过
