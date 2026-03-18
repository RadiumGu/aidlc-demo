# Unit 7: infrastructure — 代码生成摘要

## 生成文件清单

| 文件 | 说明 |
|------|------|
| infrastructure/.env.example | 环境变量模板 |
| infrastructure/.env | 开发环境默认值 |
| infrastructure/.gitignore | Git 忽略规则 |
| infrastructure/docker-compose.yml | Docker Compose 编排（7 服务） |
| infrastructure/nginx/default.conf | Nginx 配置（SPA + API 反向代理） |
| infrastructure/mysql/01-create-databases.sql | 4 个 database + 用户授权 |
| infrastructure/mysql/02-auth-schema.sql | auth_db: users 表 |
| infrastructure/mysql/03-product-schema.sql | product_db: categories + products 表 |
| infrastructure/mysql/04-points-schema.sql | points_db: 4 张表 |
| infrastructure/mysql/05-order-schema.sql | order_db: orders 表 |
| infrastructure/mysql/06-seed-data.sql | 管理员账号 + 积分配置 + 示例分类 |

## 服务端口分配

| 服务 | 容器端口 | 宿主机端口 |
|------|---------|-----------|
| mysql | 3306 | 3306 |
| auth-service | 8001 | — |
| product-service | 8002 | — |
| points-service | 8003 | — |
| order-service | 8004 | — |
| api-gateway | 8080 | 8080 |
| frontend | 80 | 3000 |

## 数据库表清单

| Database | 表 |
|----------|-----|
| auth_db | users |
| product_db | categories, products |
| points_db | point_balances, point_transactions, system_configs, distribution_batches |
| order_db | orders |
