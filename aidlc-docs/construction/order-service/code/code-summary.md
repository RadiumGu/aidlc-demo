# Unit 5: order-service — 代码摘要

## 生成概览
- **架构**: 轻量 DDD（2 个 Maven 模块）
- **新建文件**: 20 个
- **基础包名**: `com.awsome.shop.order`
- **端口**: 8004

## 文件清单

### 项目结构
| 文件 | 说明 |
|------|------|
| order-service/pom.xml | 父 POM |
| order-service/order-service-api/pom.xml | API 模块 POM |
| order-service/order-service-app/pom.xml | APP 模块 POM |
| order-service/Dockerfile | 多阶段构建 |

### API 模块 (order-service-api)
| 文件 | 说明 |
|------|------|
| common/ErrorCode.java | 错误码接口 |
| common/Result.java | 统一响应对象 |
| common/BusinessException.java | 业务异常 |
| common/PageResult.java | 分页结果 |
| enums/OrderErrorCode.java | 订单错误码（10个，含 httpStatus） |
| enums/OrderStatus.java | 订单状态枚举（含状态流转校验） |
| dto/CreateOrderRequest.java | 创建兑换请求 |
| dto/UpdateOrderStatusRequest.java | 更新状态请求 |
| dto/OrderResponse.java | 订单响应 |

### APP 模块 (order-service-app)
| 文件 | 说明 |
|------|------|
| OrderServiceApplication.java | 启动类 |
| config/MybatisPlusConfig.java | MyBatis-Plus 配置 + 分页插件 + 自动填充 |
| config/RestTemplateConfig.java | RestTemplate 超时配置 |
| model/OrderPO.java | 订单 PO 实体 |
| repository/OrderMapper.java | 订单 Mapper |
| client/ProductServiceClient.java | product-service 远程调用（含重试） |
| client/PointsServiceClient.java | points-service 远程调用（含重试） |
| service/OrderService.java | 兑换核心业务服务 |
| controller/OrderController.java | 员工兑换端点 |
| controller/AdminOrderController.java | 管理员端点 |
| exception/GlobalExceptionHandler.java | 全局异常处理 |
| resources/application.yml | 本地配置 |
| resources/application-docker.yml | Docker 配置 |

## API 端点清单

### 员工端点
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/orders | 创建兑换订单 |
| GET | /api/orders | 查询当前用户兑换历史（分页） |
| GET | /api/orders/{id} | 查询兑换详情 |

### 管理员端点
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/admin/orders | 查看所有兑换记录（分页、keyword、时间筛选） |
| PUT | /api/admin/orders/{id}/status | 更新兑换状态 |

## 跨服务调用清单

| 被调用方 | 接口 | 场景 |
|---------|------|------|
| product-service | GET /api/internal/products/{id} | 预校验-查询产品 |
| product-service | POST /api/internal/products/deduct-stock | 扣减库存 |
| product-service | POST /api/internal/products/restore-stock | 取消-恢复库存 |
| points-service | GET /api/internal/points/balance/{userId} | 预校验-查询余额 |
| points-service | POST /api/internal/points/deduct | 扣除积分 |
| points-service | POST /api/internal/points/rollback | 回滚积分 |

## 关键设计决策
1. 跨服务调用重试：仅对超时/网络异常重试1次，4xx业务错误不重试
2. 顺序扣除：先积分后库存，库存失败回滚积分
3. 补偿策略：最大努力，失败记ERROR日志由管理员处理
4. 取消退还：先更新状态再退还，退还失败不阻塞状态更新
5. 产品快照：创建订单时冗余存储productName和productImageUrl
6. 状态流转：OrderStatus.canTransitionTo()封装合法流转规则
7. OrderErrorCode含httpStatus字段：GlobalExceptionHandler直接映射HTTP状态码
8. 订单归属校验：员工只能查看自己的订单
