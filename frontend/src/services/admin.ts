import request from './request';
import type {
  Result, PageResult,
  ProductResponse, CreateProductRequest, UpdateProductRequest,
  CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest,
  UserPointResponse, PointTransactionResponse, AdjustPointsRequest,
  DistributionConfigResponse, UpdateDistributionConfigRequest,
  OrderResponse, UpdateOrderStatusRequest,
  UserResponse, UpdateUserRequest, FileResponse,
} from '../types/api';

export const adminApi = {
  // Products
  getProducts: (params: { page?: number; size?: number; categoryId?: number; keyword?: string; status?: string }) =>
    request.get<unknown, Result<PageResult<ProductResponse>>>('/admin/products', {
      params: { ...params, page: params.page != null ? params.page - 1 : undefined },
    }),
  getProductById: (id: number) =>
    request.get<unknown, Result<ProductResponse>>(`/admin/products/${id}`),
  createProduct: (data: CreateProductRequest) =>
    request.post<unknown, Result<ProductResponse>>('/admin/products', data),
  updateProduct: (id: number, data: UpdateProductRequest) =>
    request.put<unknown, Result<ProductResponse>>(`/admin/products/${id}`, data),
  deleteProduct: (id: number) =>
    request.delete(`/admin/products/${id}`),

  // Categories
  createCategory: (data: CreateCategoryRequest) =>
    request.post<unknown, Result<CategoryResponse>>('/admin/categories', data),
  updateCategory: (id: number, data: UpdateCategoryRequest) =>
    request.put<unknown, Result<CategoryResponse>>(`/admin/categories/${id}`, data),
  deleteCategory: (id: number) =>
    request.delete(`/admin/categories/${id}`),

  // Points
  getBalances: (params: { page?: number; size?: number; keyword?: string }) =>
    request.get<unknown, Result<PageResult<UserPointResponse>>>('/admin/points/balances', {
      params: { ...params, page: params.page != null ? params.page - 1 : undefined },
    }),
  getTransactions: (userId: number, params: { page?: number; size?: number; type?: string }) =>
    request.get<unknown, Result<PageResult<PointTransactionResponse>>>(`/admin/points/transactions/${userId}`, {
      params: { ...params, page: params.page != null ? params.page - 1 : undefined },
    }),
  adjustPoints: (data: AdjustPointsRequest) =>
    request.post<unknown, Result<PointTransactionResponse>>('/admin/points/adjust', data),
  getPointsConfig: () =>
    request.get<unknown, Result<DistributionConfigResponse>>('/admin/points/config'),
  updatePointsConfig: (data: UpdateDistributionConfigRequest) =>
    request.put<unknown, Result<DistributionConfigResponse>>('/admin/points/config', data),

  // Orders
  getOrders: (params: { page?: number; size?: number; keyword?: string; startDate?: string; endDate?: string }) =>
    request.get<unknown, Result<PageResult<OrderResponse>>>('/admin/orders', {
      params: { ...params, page: params.page != null ? params.page - 1 : undefined },
    }),
  getOrderById: (id: number) =>
    request.get<unknown, Result<OrderResponse>>(`/admin/orders/${id}`),
  updateOrderStatus: (id: number, data: UpdateOrderStatusRequest) =>
    request.put<unknown, Result<OrderResponse>>(`/admin/orders/${id}/status`, data),
  getUserOrderCounts: () =>
    request.get<unknown, Result<Record<string, number>>>('/admin/orders/user-counts'),

  // Users
  getUsers: (params: { page?: number; size?: number; keyword?: string }) =>
    request.get<unknown, Result<PageResult<UserResponse>>>('/admin/users', {
      params: { ...params, page: params.page != null ? params.page - 1 : undefined },
    }),
  getUserById: (id: number) =>
    request.get<unknown, Result<UserResponse>>(`/admin/users/${id}`),
  updateUser: (id: number, data: UpdateUserRequest) =>
    request.put<unknown, Result<UserResponse>>(`/admin/users/${id}`, data),

  // Files
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request.post<unknown, Result<FileResponse>>('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Dashboard Stats
  getProductStats: () =>
    request.get<unknown, Result<{ total: number; monthNew: number }>>('/admin/products/stats'),
  getUserStats: () =>
    request.get<unknown, Result<{ total: number; monthNew: number }>>('/admin/users/stats'),
  getOrderStats: () =>
    request.get<unknown, Result<{ monthOrders: number; lastMonthOrders: number }>>('/admin/orders/stats'),
  getPointsStats: () =>
    request.get<unknown, Result<{ monthDistributed: number }>>('/admin/points/stats'),
};
