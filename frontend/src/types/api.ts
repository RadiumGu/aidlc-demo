// ============ Common ============
export interface Result<T> {
  code: string;
  message: string;
  data: T;
}

export interface PageResult<T> {
  records: T[];
  total: number;
  current: number;
  size: number;
  pages: number;
}

// ============ Auth ============
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  name: string;
  employeeId: string;
}

export interface TokenResponse {
  token: string;
  userId: number;
  username: string;
  role: 'EMPLOYEE' | 'ADMIN';
  expiresIn: number;
}

export interface UserResponse {
  id: number;
  username: string;
  name: string;
  employeeId: string;
  role: string;
  status: string;
  createdAt: string;
  department?: string;
  pointsBalance?: number;
  orderCount?: number;
}

export interface UpdateUserRequest {
  name?: string;
  status?: string;
}

// ============ Product ============
export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  pointsPrice: number;
  stock: number;
  imageUrl: string | null;
  categoryId: number;
  categoryName: string;
  status: string;
  createdAt: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  pointsPrice: number;
  stock: number;
  imageUrl?: string;
  categoryId: number;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  pointsPrice?: number;
  stock?: number;
  imageUrl?: string;
  categoryId?: number;
  status?: string;
}

export interface CategoryResponse {
  id: number;
  name: string;
  parentId: number | null;
  sortOrder: number;
}

export interface CategoryTreeNode {
  id: number;
  name: string;
  sortOrder: number;
  status: string;
  productCount: number;
  children: CategoryTreeNode[];
}

export interface CreateCategoryRequest {
  name: string;
  parentId?: number | null;
  sortOrder?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  sortOrder?: number;
  status?: string;
}

export interface FileResponse {
  url: string;
}

// ============ Points ============
export interface PointBalanceResponse {
  userId: number;
  balance: number;
}

export interface PointTransactionResponse {
  id: number;
  userId: number;
  type: string;
  amount: number;
  balanceAfter: number;
  referenceId: number | null;
  operatorId: number | null;
  remark: string;
  createdAt: string;
}

export interface UserPointResponse {
  userId: number;
  balance: number;
}

export interface AdjustPointsRequest {
  userId: number;
  amount: number;
  remark: string;
}

export interface DistributionConfigResponse {
  amount: number;
  updatedAt: string;
}

export interface UpdateDistributionConfigRequest {
  amount: number;
}

// ============ Order ============
export interface OrderResponse {
  id: number;
  userId: number;
  username?: string;
  productId: number;
  productName: string;
  productImageUrl: string | null;
  pointsCost: number;
  status: 'PENDING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  receiverName?: string;
  receiverPhone?: string;
  receiverAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  productId: number;
  username?: string;
  receiverName?: string;
  receiverPhone?: string;
  receiverAddress?: string;
}

export interface UpdateOrderStatusRequest {
  status: string;
}
