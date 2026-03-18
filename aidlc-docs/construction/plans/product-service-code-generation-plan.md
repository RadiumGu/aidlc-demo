# Unit 3: product-service — 代码生成计划

## 单元上下文
- **单元名称**: product-service（产品服务）
- **类型**: Greenfield — 从零创建
- **架构**: 轻量 DDD（两个 Maven 模块：product-service-api + product-service-app）
- **基础包名**: `com.awsome.shop.product`
- **端口**: 8002
- **依赖**: Unit 7 (infrastructure) — MySQL 数据库 (product_db)、Docker 网络
- **被调用方**: order-service (内部接口 /api/internal/products/*)、api-gateway (路由转发)

## 关联用户故事
- US-013: 管理员添加产品
- US-014: 管理员编辑产品
- US-015: 管理员删除产品（软删除）
- US-016: 管理员管理分类
- US-017: 员工浏览产品列表
- US-018: 员工查看产品详情
- US-019: 文件上传（产品图片）
- 内部接口: 库存扣减/恢复（供 order-service 调用）

## 模块结构

```
product-service/
├── pom.xml                          # 父 POM
├── product-service-api/             # API 模块（DTO、接口定义）
│   ├── pom.xml
│   └── src/main/java/com/awsome/shop/product/
│       ├── dto/                     # 请求/响应 DTO
│       └── enums/                   # 枚举、错误码
├── product-service-app/             # APP 模块（实现、启动）
│   ├── pom.xml
│   └── src/main/java/com/awsome/shop/product/
│       ├── controller/              # REST 控制器
│       ├── service/                 # 业务服务
│       ├── repository/              # 数据访问（MyBatis-Plus）
│       ├── model/                   # PO 实体
│       ├── config/                  # 配置类
│       ├── exception/               # 异常处理
│       └── ProductServiceApplication.java
│   └── src/main/resources/
│       ├── application.yml
│       └── application-docker.yml
└── Dockerfile
```

## 生成步骤

### Step 1: Maven 项目结构 — 父 POM + 子模块 POM
- [x] 创建 `product-service/pom.xml`（父 POM）
  - groupId: com.awsome.shop
  - artifactId: awsome-shop-product-service
  - 版本管理: Spring Boot 3.4.1, MyBatis-Plus 3.5.7, Druid 1.2.20, Lombok
  - modules: product-service-api, product-service-app
- [x] 创建 `product-service/product-service-api/pom.xml`
  - 依赖: lombok, jakarta-validation-api
- [x] 创建 `product-service/product-service-app/pom.xml`
  - 依赖: product-service-api, spring-boot-starter-web, spring-boot-starter-validation, mybatis-plus-spring-boot3-starter, druid-spring-boot-3-starter, mysql-connector-j, spring-boot-starter-actuator, lombok
  - spring-boot-maven-plugin 打包

### Step 2: 通用基础类 — ErrorCode + Result + BusinessException + PageResult
- [x] 创建 `product-service/product-service-api/src/main/java/com/awsome/shop/product/common/ErrorCode.java`（接口）
- [x] 创建 `product-service/product-service-api/src/main/java/com/awsome/shop/product/common/Result.java`
- [x] 创建 `product-service/product-service-api/src/main/java/com/awsome/shop/product/common/BusinessException.java`
- [x] 创建 `product-service/product-service-api/src/main/java/com/awsome/shop/product/common/PageResult.java`
  - 复制 auth-service 的模式，调整包名

### Step 3: 错误码定义 — ProductErrorCode + CategoryErrorCode + FileErrorCode
- [x] 创建 `product-service/product-service-api/src/main/java/com/awsome/shop/product/enums/ProductErrorCode.java`
  - CATEGORY_NOT_FOUND("NOT_FOUND_001", "分类不存在")
  - PRODUCT_NOT_FOUND("NOT_FOUND_002", "产品不存在")
  - STOCK_INSUFFICIENT("CONFLICT_001", "库存不足")
  - PRODUCT_PARAM_INVALID("PARAM_001", "产品参数校验失败")
- [x] 创建 `product-service/product-service-api/src/main/java/com/awsome/shop/product/enums/CategoryErrorCode.java`
  - CATEGORY_NOT_FOUND("NOT_FOUND_001", "分类不存在")
  - CATEGORY_LEVEL_EXCEEDED("PARAM_002", "超过分类层级限制（最大2级）")
  - CATEGORY_HAS_CHILDREN("CONFLICT_002", "分类下有子分类，无法删除")
  - CATEGORY_HAS_PRODUCTS("CONFLICT_003", "分类下有产品，无法删除")
  - CATEGORY_PARAM_INVALID("PARAM_003", "分类参数校验失败")
- [x] 创建 `product-service/product-service-api/src/main/java/com/awsome/shop/product/enums/FileErrorCode.java`
  - FILE_EMPTY("PARAM_004", "文件为空")
  - FILE_TOO_LARGE("PARAM_005", "文件大小超过限制")
  - FILE_TYPE_NOT_SUPPORTED("PARAM_006", "不支持的文件类型")

### Step 4: 枚举 — ProductStatus
- [x] 创建 `product-service/product-service-api/src/main/java/com/awsome/shop/product/enums/ProductStatus.java`
  - ACTIVE, INACTIVE

### Step 5: DTO — 请求/响应对象
- [x] 创建 `product-service/product-service-api/src/main/java/com/awsome/shop/product/dto/CreateProductRequest.java`
  - Jakarta Validation 注解: @NotBlank name, @NotNull @Min(1) pointsPrice, @NotNull @Min(0) stock, @NotNull categoryId
- [x] 创建 `product-service/product-service-api/src/main/java/com/awsome/shop/product/dto/UpdateProductRequest.java`
  - 所有字段可选（nullable）
- [x] 创建 `product-service/product-service-api/src/main/java/com/awsome/shop/product/dto/CreateCategoryRequest.java`
  - @NotBlank name, parentId 可选, sortOrder 可选默认 0
- [x] 创建 `product-service/product-service-api/src/main/java/com/awsome/shop/product/dto/UpdateCategoryRequest.java`
  - 所有字段可选
- [x] 创建 `product-service/product-service-api/src/main/java/com/awsome/shop/product/dto/StockDeductRequest.java`
  - @NotNull productId, @NotNull @Min(1) quantity
- [x] 创建 `product-service/product-service-api/src/main/java/com/awsome/shop/product/dto/ProductResponse.java`
  - id, name, description, pointsPrice, stock, imageUrl, categoryId, categoryName, status, createdAt
- [x] 创建 `product-service/product-service-api/src/main/java/com/awsome/shop/product/dto/CategoryResponse.java`
  - id, name, parentId, sortOrder
- [x] 创建 `product-service/product-service-api/src/main/java/com/awsome/shop/product/dto/CategoryTreeNode.java`
  - id, name, sortOrder, children (List<CategoryTreeNode>)
- [x] 创建 `product-service/product-service-api/src/main/java/com/awsome/shop/product/dto/FileResponse.java`
  - url, filename

### Step 6: PO 实体 — ProductPO + CategoryPO
- [x] 创建 `product-service/product-service-app/src/main/java/com/awsome/shop/product/model/ProductPO.java`
  - @TableName("products"), MyBatis-Plus 注解
  - 字段映射: id, name, description, pointsPrice, stock, imageUrl, categoryId, status, createdAt, updatedAt
- [x] 创建 `product-service/product-service-app/src/main/java/com/awsome/shop/product/model/CategoryPO.java`
  - @TableName("categories")
  - 字段映射: id, name, parentId, sortOrder, createdAt, updatedAt

### Step 7: MyBatis-Plus Mapper + 配置
- [x] 创建 `product-service/product-service-app/src/main/java/com/awsome/shop/product/repository/ProductMapper.java`
  - extends BaseMapper<ProductPO>
  - 自定义方法: selectByIdForUpdate(Long id) — 悲观锁查询 @Select("SELECT * FROM products WHERE id = #{id} FOR UPDATE")
- [x] 创建 `product-service/product-service-app/src/main/java/com/awsome/shop/product/repository/CategoryMapper.java`
  - extends BaseMapper<CategoryPO>
- [x] 创建 `product-service/product-service-app/src/main/java/com/awsome/shop/product/config/MybatisPlusConfig.java`
  - @MapperScan, 分页插件 PaginationInnerInterceptor

### Step 8: 业务服务 — CategoryService
- [x] 创建 `product-service/product-service-app/src/main/java/com/awsome/shop/product/service/CategoryService.java`
  - createCategory(CreateCategoryRequest): CategoryResponse
  - updateCategory(Long id, UpdateCategoryRequest): CategoryResponse
  - deleteCategory(Long id): void
  - getCategoryTree(): List<CategoryTreeNode>
  - getCategoryById(Long id): CategoryPO（内部使用）
  - getSubCategoryIds(Long categoryId): List<Long>（获取子分类 ID 列表，用于产品筛选）
  - 层级校验: 最大 2 级
  - 删除前置条件: 无子分类 AND 无 ACTIVE 产品

### Step 9: 业务服务 — ProductService
- [x] 创建 `product-service/product-service-app/src/main/java/com/awsome/shop/product/service/ProductService.java`
  - createProduct(CreateProductRequest): ProductResponse
  - updateProduct(Long id, UpdateProductRequest): ProductResponse
  - deleteProduct(Long id): void（软删除 → INACTIVE）
  - getProductDetail(Long id): ProductResponse（员工端，仅 ACTIVE）
  - getProductList(int page, int size, Long categoryId, String keyword): PageResult<ProductResponse>（员工端，仅 ACTIVE）
  - getAdminProductList(int page, int size, Long categoryId, String keyword, String status): PageResult<ProductResponse>（管理员端，含 INACTIVE）
  - getProductById(Long id): ProductResponse（内部接口，不限状态）
  - deductStock(Long productId, int quantity): void（悲观锁 @Transactional）
  - restoreStock(Long productId, int quantity): void
  - PO → Response 转换时填充 categoryName

### Step 10: 业务服务 — FileService
- [x] 创建 `product-service/product-service-app/src/main/java/com/awsome/shop/product/service/FileService.java`
  - upload(MultipartFile file): FileResponse
  - getFile(String filename): Resource
  - 校验: 非空、大小 ≤ MAX_FILE_SIZE、扩展名白名单 (jpg/jpeg/png/gif/webp)
  - UUID 重命名: UUID + 原始扩展名
  - 存储目录: UPLOAD_DIR 环境变量
- [x] 创建 `product-service/product-service-app/src/main/java/com/awsome/shop/product/config/FileConfig.java`
  - @Value UPLOAD_DIR, MAX_FILE_SIZE
  - @PostConstruct 确保目录存在

### Step 11: 控制器 — 6 个 Controller
- [x] 创建 `product-service/product-service-app/src/main/java/com/awsome/shop/product/controller/ProductController.java`
  - GET /api/products — 产品列表（分页、搜索、分类筛选）
  - GET /api/products/{id} — 产品详情
- [x] 创建 `product-service/product-service-app/src/main/java/com/awsome/shop/product/controller/AdminProductController.java`
  - POST /api/admin/products — 创建产品
  - PUT /api/admin/products/{id} — 更新产品
  - DELETE /api/admin/products/{id} — 删除产品（软删除）
  - GET /api/admin/products — 管理员产品列表
- [x] 创建 `product-service/product-service-app/src/main/java/com/awsome/shop/product/controller/CategoryController.java`
  - GET /api/categories/tree — 分类树
- [x] 创建 `product-service/product-service-app/src/main/java/com/awsome/shop/product/controller/AdminCategoryController.java`
  - POST /api/admin/categories — 创建分类
  - PUT /api/admin/categories/{id} — 更新分类
  - DELETE /api/admin/categories/{id} — 删除分类
- [x] 创建 `product-service/product-service-app/src/main/java/com/awsome/shop/product/controller/FileController.java`
  - POST /api/files/upload — 上传图片
  - GET /api/files/{filename} — 获取图片（Cache-Control: public, max-age=86400）
- [x] 创建 `product-service/product-service-app/src/main/java/com/awsome/shop/product/controller/InternalProductController.java`
  - GET /api/internal/products/{id} — 获取产品信息
  - POST /api/internal/products/deduct-stock — 扣减库存
  - POST /api/internal/products/restore-stock — 恢复库存

### Step 12: 全局异常处理 — GlobalExceptionHandler
- [x] 创建 `product-service/product-service-app/src/main/java/com/awsome/shop/product/exception/GlobalExceptionHandler.java`
  - @RestControllerAdvice
  - 处理 BusinessException → 根据 errorCode 前缀映射 HTTP 状态码
  - 处理 MethodArgumentNotValidException → PARAM_001
  - 处理 MaxUploadSizeExceededException → FILE_002
  - 处理 Exception → 500 通用错误

### Step 13: 启动类 + 配置文件
- [x] 创建 `product-service/product-service-app/src/main/java/com/awsome/shop/product/ProductServiceApplication.java`
  - @SpringBootApplication
- [x] 创建 `product-service/product-service-app/src/main/resources/application.yml`
  - server.port: 8002
  - 本地开发数据源配置
  - MyBatis-Plus 配置
  - spring.servlet.multipart.max-file-size / max-request-size
- [x] 创建 `product-service/product-service-app/src/main/resources/application-docker.yml`
  - 环境变量引用: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
  - UPLOAD_DIR, MAX_FILE_SIZE, SERVER_PORT

### Step 14: Dockerfile
- [x] 创建 `product-service/Dockerfile`
  - 多阶段构建: Maven 构建 + JRE 运行
  - 基于 eclipse-temurin:21-jre
  - 创建 /app/uploads 目录
  - EXPOSE 8002

### Step 15: 代码摘要文档
- [x] 创建 `aidlc-docs/construction/product-service/code/code-summary.md`
  - 列出所有生成的文件
  - 记录关键设计决策
  - 记录 API 端点清单
