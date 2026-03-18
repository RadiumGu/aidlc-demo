# Unit 4: points-service — 代码摘要

## 生成概览
- **架构**: 轻量 DDD（2 个 Maven 模块）
- **新建文件**: 33 个
- **基础包名**: `com.awsome.shop.points`
- **端口**: 8003

## 文件清单

### 项目结构
| 文件 | 说明 |
|------|------|
| points-service/pom.xml | 父 POM |
| points-service/points-service-api/pom.xml | API 模块 POM |
| points-service/points-service-app/pom.xml | APP 模块 POM |
| points-service/Dockerfile | 多阶段构建 |

### API 模块 (points-service-api)
| 文件 | 说明 |
|------|------|
| common/ErrorCode.java | 错误码接口 |
| common/Result.java | 统一响应对象 |
| common/BusinessException.java | 业务异常 |
| common/PageResult.java | 分页结果 |
| enums/PointsErrorCode.java | 积分错误码（7个，含 httpStatus） |
| enums/TransactionType.java | 变动类型枚举（5种） |
| dto/InitPointsRequest.java | 积分初始化请求 |
| dto/AdjustPointsRequest.java | 手动调整请求 |
| dto/DeductPointsRequest.java | 兑换扣除请求 |
| dto/RollbackDeductionRequest.java | 兑换回滚请求 |
| dto/UpdateDistributionConfigRequest.java | 更新发放配置请求 |
| dto/PointBalanceResponse.java | 积分余额响应 |
| dto/PointTransactionResponse.java | 积分变动响应 |
| dto/UserPointResponse.java | 员工积分列表响应 |
| dto/DistributionConfigResponse.java | 发放配置响应 |

### APP 模块 (points-service-app)
| 文件 | 说明 |
|------|------|
| PointsServiceApplication.java | 启动类（@EnableScheduling） |
| config/MybatisPlusConfig.java | MyBatis-Plus 配置 + 分页插件 |
| model/PointBalancePO.java | 积分余额 PO |
| model/PointTransactionPO.java | 积分变动流水 PO |
| model/SystemConfigPO.java | 系统配置 PO |
| model/DistributionBatchPO.java | 发放批次 PO |
| repository/PointBalanceMapper.java | 余额 Mapper（含悲观锁） |
| repository/PointTransactionMapper.java | 流水 Mapper |
| repository/SystemConfigMapper.java | 配置 Mapper |
| repository/DistributionBatchMapper.java | 批次 Mapper |
| service/PointsService.java | 积分核心业务服务 |
| service/DistributionService.java | 发放业务服务（含补发） |
| service/ConfigService.java | 配置管理服务 |
| scheduler/DistributionScheduler.java | 定时任务（每月1日2:00） |
| controller/PointsController.java | 员工积分端点 |
| controller/AdminPointsController.java | 管理员积分端点 |
| controller/InternalPointsController.java | 内部接口端点 |
| exception/GlobalExceptionHandler.java | 全局异常处理 |
| resources/application.yml | 本地配置 |
| resources/application-docker.yml | Docker 配置 |

## API 端点清单

### 员工端点
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/points/balance | 查询当前用户积分余额 |
| GET | /api/points/transactions | 查询积分变动历史（分页） |

### 管理员端点
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/admin/points/balances | 查看所有员工积分余额（分页、keyword） |
| GET | /api/admin/points/transactions/{userId} | 查看指定员工变动明细（分页、type筛选） |
| POST | /api/admin/points/adjust | 手动调整积分（悲观锁） |
| GET | /api/admin/points/config | 获取发放配置 |
| PUT | /api/admin/points/config | 更新发放配置 |

### 内部端点
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/internal/points/init | 初始化用户积分余额（幂等） |
| POST | /api/internal/points/deduct | 兑换扣除积分（悲观锁） |
| POST | /api/internal/points/rollback | 回滚积分扣除（唯一性校验） |
| GET | /api/internal/points/balance/{userId} | 查询指定用户积分余额 |

## 关键设计决策
1. 悲观锁余额变动：PointBalanceMapper.selectByUserIdForUpdate() 使用 SELECT FOR UPDATE
2. 积分初始化幂等：重复调用返回已有记录，不报错
3. 回滚唯一性：通过查询 ROLLBACK + referenceId 防止重复回滚
4. 定时任务批次跟踪：distribution_batches 表记录发放过程，支持补发
5. 独立事务发放：每用户发放使用 REQUIRES_NEW，单条失败不影响整体
6. PointsErrorCode 含 httpStatus 字段：GlobalExceptionHandler 直接映射 HTTP 状态码
7. 发放配置默认值：system_configs 无记录时使用默认值 100
