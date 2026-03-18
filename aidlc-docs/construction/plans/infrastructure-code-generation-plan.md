# Unit 7: infrastructure — 代码生成计划

## 单元上下文
- **单元名称**: infrastructure (deploy)
- **类型**: 基础设施编排
- **职责**: Docker Compose 编排、MySQL 初始化、Nginx 配置、环境变量管理
- **依赖**: 无（其他所有 Unit 依赖此 Unit）
- **代码位置**: `infrastructure/` 目录（工作区根目录下）

## 关联用户故事
- US-025: 系统部署与运维（横切支撑）
- 所有用户故事的基础设施支撑

## 生成步骤

### Step 1: 项目结构创建
- [x] 创建 `infrastructure/` 目录结构
- [x] 创建 `infrastructure/mysql/` 目录
- [x] 创建 `infrastructure/nginx/` 目录

### Step 2: 环境变量模板
- [x] 创建 `infrastructure/.env.example` — 环境变量模板（含所有服务配置）
- [x] 创建 `infrastructure/.env` — 开发环境默认值（与 .env.example 相同）

### Step 3: MySQL 初始化脚本 — 数据库和用户创建
- [x] 创建 `infrastructure/mysql/01-create-databases.sql` — 创建 4 个 database + 用户授权

### Step 4: MySQL 初始化脚本 — auth_db 表结构
- [x] 创建 `infrastructure/mysql/02-auth-schema.sql` — users 表

### Step 5: MySQL 初始化脚本 — product_db 表结构
- [x] 创建 `infrastructure/mysql/03-product-schema.sql` — categories + products 表

### Step 6: MySQL 初始化脚本 — points_db 表结构
- [x] 创建 `infrastructure/mysql/04-points-schema.sql` — point_balances + point_transactions + system_configs + distribution_batches 表

### Step 7: MySQL 初始化脚本 — order_db 表结构
- [x] 创建 `infrastructure/mysql/05-order-schema.sql` — orders 表

### Step 8: MySQL 初始化脚本 — 种子数据
- [x] 创建 `infrastructure/mysql/06-seed-data.sql` — 管理员账号 + 积分配置 + 示例分类

### Step 9: Nginx 配置
- [x] 创建 `infrastructure/nginx/default.conf` — SPA 路由 + API 反向代理 + Gzip + 健康检查

### Step 10: Docker Compose 配置
- [x] 创建 `infrastructure/docker-compose.yml` — 完整的 7 服务编排

### Step 11: .gitignore
- [x] 创建 `infrastructure/.gitignore` — 忽略 .env 和上传目录

### Step 12: 文档摘要
- [x] 创建 `aidlc-docs/construction/infrastructure/code/code-summary.md` — 代码生成摘要
