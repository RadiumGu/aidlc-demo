import request from './request';

// Auth
export const authApi = {
  login: (data: { username: string; password: string }) =>
    request.post('/v1/public/auth/login', data),
  logout: () => request.post('/v1/auth/logout'),
  refresh: (data: { refreshToken: string }) =>
    request.post('/v1/public/auth/refresh', data),
  me: () => request.get('/v1/auth/me'),
};

// Product
export const productApi = {
  list: (data: {
    pageNum: number;
    pageSize: number;
    keyword?: string;
    category?: string;
  }) => request.post('/v1/public/product/list', data),
  detail: (id: number) => request.get(`/v1/public/product/${id}`),
  create: (data: Record<string, unknown>) =>
    request.post('/v1/admin/product/create', data),
  update: (data: Record<string, unknown>) =>
    request.post('/v1/admin/product/update', data),
  updateStatus: (data: { id: number; status: number }) =>
    request.post('/v1/admin/product/status', data),
};

// Points
export const pointsApi = {
  balance: () => request.get('/v1/points/balance'),
  transactions: (data: { pageNum: number; pageSize: number; employeeId?: number }) =>
    request.post('/v1/points/transactions', data),
  adminAdd: (data: { employeeId: number; amount: number; remark: string }) =>
    request.post('/v1/admin/points/add', data),
  adminDeduct: (data: { employeeId: number; amount: number; remark: string }) =>
    request.post('/v1/admin/points/deduct', data),
};

// Order
export const orderApi = {
  create: (data: { productId: number; quantity: number }) =>
    request.post('/v1/order/create', data),
  list: (data: { pageNum: number; pageSize: number; status?: string }) =>
    request.post('/v1/order/list', data),
  detail: (id: number) => request.get(`/v1/order/${id}`),
  cancel: (data: { orderId: number; reason?: string }) =>
    request.post('/v1/order/cancel', data),
  adminList: (data: { pageNum: number; pageSize: number; status?: string }) =>
    request.post('/v1/admin/order/list', data),
  ship: (data: { orderId: number }) => request.post('/v1/admin/order/ship', data),
  complete: (data: { orderId: number }) =>
    request.post('/v1/admin/order/complete', data),
};
