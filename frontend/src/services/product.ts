import request from './request';
import type { Result, PageResult, ProductResponse, CategoryTreeNode } from '../types/api';

export const productApi = {
  getProducts: (params: { page?: number; size?: number; categoryId?: number; keyword?: string }) =>
    request.get<unknown, Result<PageResult<ProductResponse>>>('/products', {
      params: { ...params, page: params.page != null ? params.page - 1 : undefined },
    }),

  getProductById: (id: number) =>
    request.get<unknown, Result<ProductResponse>>(`/products/${id}`),

  getCategoryTree: () =>
    request.get<unknown, Result<CategoryTreeNode[]>>('/categories/tree'),
};
