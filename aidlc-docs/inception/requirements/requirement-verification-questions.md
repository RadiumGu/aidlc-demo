# 需求澄清问题

基于产品需求文档 (`plan/doc/original-intent.md`) 和现有代码分析，以下问题需要确认以完善需求。

---

## 问题 1
本次开发的范围是什么？

A) 完整实现 MVP 所有功能（认证、商品、积分、订单、前端对接）
B) 仅实现后端缺失的业务逻辑（Auth/Points/Order Service），前端保持 Mock
C) 仅实现某几个服务的业务逻辑（请在下方说明）
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## 问题 2
员工登录认证方式？

A) 用户名 + 密码（数据库存储员工账号）
B) 企业 SSO / OIDC 集成
C) AWS Cognito 托管认证
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## 问题 3
积分兑换流程中，是否需要库存扣减和积分扣减的事务一致性保障？

A) 是，需要强一致性（分布式事务）
B) 最终一致性即可（异步补偿/Saga 模式）
C) MVP 阶段简单处理，先不考虑分布式事务
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## 问题 4
管理员和普通员工是否共用一套用户体系？角色如何区分？

A) 同一张用户表，通过角色字段区分（admin/employee）
B) 分开的用户表和认证流程
C) 管理员使用独立的管理后台入口和账号体系
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## 问题 5
积分管理方面，管理员手动发放/扣除积分时，是否需要审批流程？

A) 不需要，管理员直接操作生效
B) 需要，发放/扣除需要上级审批
C) MVP 阶段不需要审批，后续迭代加
D) Other (please describe after [Answer]: tag below)

[Answer]: C

---

## 问题 6
订单状态流转需要哪些状态？

A) 简单流程：待处理 → 已完成 / 已取消
B) 标准流程：待处理 → 待发货 → 已发货 → 已完成 / 已取消
C) MVP 阶段仅需：下单成功 → 完成
D) Other (please describe after [Answer]: tag below)

[Answer]: B

---

## 问题 7
商品是否需要支持分类筛选和搜索功能？

A) 是，需要按分类浏览和关键词搜索
B) 仅按分类浏览，不需要搜索
C) MVP 阶段仅需商品列表，不需要筛选和搜索
D) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## 问题 8
是否有性能或并发方面的预期？比如预计多少员工同时使用？

A) 小规模（< 100 人同时在线）
B) 中规模（100-1000 人同时在线）
C) 大规模（> 1000 人同时在线）
D) MVP 阶段不需要考虑性能，先把功能做出来
E) Other (please describe after [Answer]: tag below)

[Answer]: A

---

请在每个问题的 `[Answer]:` 后填写你的选择（A/B/C/D 等），填完后告诉我。
