# 用户故事 → 工作单元映射

## 映射表

| 用户故事 | 标题 | 工作单元 |
|---------|------|---------|
| US-01 | 员工登录 | Unit 1: Auth + Unit 6: Frontend |
| US-02 | 员工退出登录 | Unit 1: Auth + Unit 6: Frontend |
| US-03 | 浏览商品列表 | Unit 2: Product + Unit 6: Frontend |
| US-04 | 按分类筛选商品 | Unit 2: Product + Unit 6: Frontend |
| US-05 | 搜索商品 | Unit 2: Product + Unit 6: Frontend |
| US-06 | 查看商品详情 | Unit 2: Product + Unit 6: Frontend |
| US-07 | 积分兑换下单 | Unit 4: Order + Unit 6: Frontend |
| US-08 | 查看积分余额 | Unit 3: Points + Unit 6: Frontend |
| US-09 | 查看积分变动历史 | Unit 3: Points + Unit 6: Frontend |
| US-10 | 查看我的订单 | Unit 4: Order + Unit 6: Frontend |
| US-11 | 管理员登录 | Unit 1: Auth + Unit 5: Gateway + Unit 6: Frontend |
| US-12 | 创建商品 | Unit 2: Product + Unit 6: Frontend |
| US-13 | 编辑商品 | Unit 2: Product + Unit 6: Frontend |
| US-14 | 商品上下架 | Unit 2: Product + Unit 6: Frontend |
| US-15 | 发放积分 | Unit 3: Points + Unit 6: Frontend |
| US-16 | 扣除积分 | Unit 3: Points + Unit 6: Frontend |
| US-17 | 查看所有订单 | Unit 4: Order + Unit 6: Frontend |
| US-18 | 更新订单状态 | Unit 4: Order + Unit 6: Frontend |

## 各单元故事统计

| 工作单元 | 主要负责故事 | 配合故事 | 合计 |
|---------|-------------|---------|------|
| Unit 1: Auth | US-01, US-02, US-11 | — | 3 |
| Unit 2: Product | US-03, US-04, US-05, US-06, US-12, US-13, US-14 | — | 7 |
| Unit 3: Points | US-08, US-09, US-15, US-16 | — | 4 |
| Unit 4: Order | US-07, US-10, US-17, US-18 | — | 4 |
| Unit 5: Gateway | US-11（角色权限） | — | 1 |
| Unit 6: Frontend | — | US-01~US-18 全部 | 18 |

## 覆盖度检查

- ✅ 全部 18 个用户故事均已映射到工作单元
- ✅ 每个用户故事至少有一个后端单元 + 前端单元
- ✅ 无孤立故事（未分配到任何单元）
- ✅ Unit 6 (Frontend) 参与所有故事的前端实现
