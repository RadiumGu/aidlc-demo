# Unit 3: product-service — 代码摘要

## 生成概览
- **架构**: 轻量 DDD（2 个 Maven 模块）
- **新建文件**: 30 个
- **基础包名**: `com.awsome.shop.product`
- **端口**: 8002

## 文件清单

### 项目结构
| 文件 | 说明 |
|------|------|
| product-service/pom.xml | 父 POM |
| product-service/product-service-api/pom.xml | API 模块 POM |
| product-service/product-service-app/pom.xml | APP 模块 POM |
| product-service/Dockerfile | 多阶段构建 |

### API 模块 (product-service-api)
| 文件 | 说明 |
|------|------|
| common/ErrorCode.java | 错误码接口 |
| common/Result.java | 统一响应对象 |
| common/BusinessException.java | 业务异常 |
| common/PageResult.java | 分页结果 |
| enums/ProductStatus.java | 产品状态枚举 |
| enums/ProductErrorCode.java | 产品错误码 |
| enums/CategoryErrorCode.java | 分类错误码 |
| enums/FileErrorCode.java | 文件错误码 |
| dto/CreateProductRequest.java | 创建产品请求 |
| dto/UpdateProductRequest.java | 更新产品请求 |
| dto/CreateCategoryRequest.java | 创建分类请求 |
| dto/UpdateCategoryRequest.java | 更新分类请求 |
| dto/StockDeductRequest.java | 库存扣减请求 |
| dto/ProductResponse.java | 产品响应 |
| dto/CategoryResponse.java | 分类响应 |
| dto/CategoryTreeNode.java | 分类树节点 |
| dto/FileResponse.java | 文件上传响应 |

### APP 模块 (product-service-app)
| 文件 | 说明 |
|------|------|
| ProductServiceApplication.java | 启动类 |
| config/MybatisPlusConfig.java | MyBatis-Plus 配置 |
| config/FileConfig.java | 文件上传配置 |
| model/ProductPO.java | 产品 PO |
| model/CategoryPO.java | 分类 PO |
| repository/ProductMapper.java | 产品 Mapper（含悲观锁） |
| repository/CategoryMapper.java | 分类 Mapper |
| service/ProductService.java | 产品业务服务 |
| service/CategoryService.java | 分类业务服务 |
| service/FileService.java | 文件业务服务 |
| controller/ProductController.java | 员工产品端点 |
| controller/AdminProductController.java | 管理员产品端点 |
| controller/CategoryController.java | 分类树端点 |
| controller/AdminCategoryController.java | 管理员分类端点 |
| controller/FileController.java | 文件端点 |
| controller/InternalProductController.java | 内部接口端点 |
| exception/GlobalExceptionHandler.java | 全局异常处理 |
| resources/application.yml | 本地配置 |
| resources/application-docker.yml | Docker 配置 |

## API 端点清单

### 员工端点
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/products | 产品列表（分页、搜索、分类筛选） |
| GET | /api/products/{id} | 产品详情 |
| GET | /api/categories/tree | 分类树 |

### 管理员端点
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/admin/products | 创建产品 |
| PUT | /api/admin/products/{id} | 更新产品 |
| DELETE | /api/admin/products/{id} | 删除产品（软删除） |
| GET | /api/admin/products | 管理员产品列表 |
| POST | /api/admin/categories | 创建分类 |
| PUT | /api/admin/categories/{id} | 更新分类 |
| DELETE | /api/admin/categories/{id} | 删除分类 |

### 文件端点
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/files/upload | 上传图片 |
| GET | /api/files/{filename} | 获取图片 |

### 内部端点
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/internal/products/{id} | 获取产品信息 |
| POST | /api/internal/products/deduct-stock | 扣减库存（悲观锁） |
| POST | /api/internal/products/restore-stock | 恢复库存 |

## 关键设计决策
1. 悲观锁库存扣减：ProductMapper.selectByIdForUpdate() 使用 SELECT FOR UPDATE
2. 文件上传安全：白名单校验 + UUID 重命名 + 大小限制
3. 分类树：全量查询 + 内存组装（最大 2 级）
4. 产品软删除：status 设为 INACTIVE，不物理删除
5. 分类筛选：一级分类自动包含所有二级子分类的产品
6. 图片缓存：Cache-Control: public, max-age=86400
