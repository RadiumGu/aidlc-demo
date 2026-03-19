import request from './request';
import type { Result, PageResult, OrderResponse, CreateOrderRequest } from '../types/api';

export const orderApi = {
  createOrder: (data: CreateOrderRequest) =>
    request.post<unknown, Result<OrderResponse>>('/orders', data),

  getMyOrders: (params: { page?: number; size?: number }) =>
    request.get<unknown, Result<PageResult<OrderResponse>>>('/orders', {
      params: { ...params, page: params.page != null ? params.page - 1 : undefined },
    }),

  getOrderById: (id: number) =>
    request.get<unknown, Result<OrderResponse>>(`/orders/${id}`),
};
