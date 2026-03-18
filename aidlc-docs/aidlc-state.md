# AI-DLC 工作流状态

## 项目信息
- **项目名称**: AWSomeShop - 内部员工福利电商网站
- **项目类型**: Greenfield（全新项目）+ 部分框架已搭建
- **开始日期**: 2026-02-08T00:00:00Z
- **当前阶段**: CONSTRUCTION - 代码生成准备
- **首选语言**: 中文 (B)
- **原始文档位置**: plan/aidlc-docs/

## 关键决策记录（2026-03-18）

### 决策 1：后端架构策略
- **auth-service**: 保留现有 DDD 六模块架构（common/domain/application/interface/infrastructure/bootstrap）
- **其他微服务**（product-service、points-service、order-service、api-gateway）: 采用轻量 DDD（两个 Maven 模块：xxx-api + xxx-app）
- **infrastructure/deploy**: 从零创建

### 决策 2：代码框架来源
- **auth-service**: 复用已有框架（Java 21 + Spring Boot 3.4.1 + MyBatis-Plus + JWT）
- **frontend**: 复用已有框架（React 19 + Vite + MUI 6 + Zustand + React Router 7 + i18next + Axios），可重构
- **其他微服务**: 从零创建，技术栈与 auth-service 保持一致

### 决策 3：前端代码策略
- 尽量复用已有代码（Login、Home、Dashboard、ShopHome、Layout、i18n 等）
- 需要重构的部分可以重构
- 在已有基础上扩展新页面

### 决策 4：设计稿页面范围
- 仅实现原始需求文档中明确的页面
- 设计稿中新增但需求未提及的页面暂不实现（如 Admin-Team、Employee-Delivery Info 等）

## 技术栈确认
- **后端**: Java 21, Spring Boot 3.4.1, MyBatis-Plus 3.5.7, Druid, JWT (jjwt 0.12.6), Lombok
- **前端**: React 19, TypeScript, Vite 7, MUI 6, Zustand 5, React Router 7, i18next, Axios
- **数据库**: MySQL 8.4 LTS
- **部署**: Docker + Docker Compose
- **构建**: Maven (后端), npm (前端)

## 阶段进度
- [x] 工作区检测 - 完成
- [x] 需求分析 - 完成
- [x] 用户故事 - 完成（25个故事，3个用户画像）
- [x] 工作流规划 - 完成
- [x] 应用设计 - 完成
- [x] 工作单元生成 - 完成（7个工作单元）
- [x] 功能设计 - 完成（全部7个 Unit）
- [x] NFR需求 - 完成（全部7个 Unit）
- [x] NFR设计 - 完成（全部7个 Unit）
- [x] 基础设施设计 - 完成（全部7个 Unit）
- [ ] 代码生成 — 待执行（下一步）
- [ ] 构建和测试 — 待执行

## 代码生成顺序（建议）
1. Unit 7: infrastructure/deploy — Docker Compose + MySQL 初始化 + Nginx 配置
2. Unit 2: auth-service — 在已有 DDD 框架上实现业务逻辑
3. Unit 3: product-service — 轻量 DDD，从零创建
4. Unit 4: points-service — 轻量 DDD，从零创建
5. Unit 5: order-service — 轻量 DDD，从零创建
6. Unit 6: api-gateway — 轻量 DDD，从零创建
7. Unit 1: frontend — 在已有 React 框架上扩展
