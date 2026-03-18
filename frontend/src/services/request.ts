import axios from 'axios';

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/shop/api',
  timeout: 10000,
});

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * 标准化后端响应格式
 * - Auth/Product/Order 返回 code:"SUCCESS" → 转成 code:0
 * - Points 返回 code:0 → 保持不变
 * - 分页数据 records → list
 */
function normalizeResponse(data: Record<string, unknown>): Record<string, unknown> {
  // 标准化 code
  if (data.code === 'SUCCESS') {
    data.code = 0;
  }
  // 标准化 success 字段
  if (data.code === 0) {
    data.success = true;
  }
  // 标准化分页数据: records → list
  if (data.data && typeof data.data === 'object' && 'records' in (data.data as Record<string, unknown>)) {
    const pageData = data.data as Record<string, unknown>;
    pageData.list = pageData.records;
    delete pageData.records;
  }
  return data;
}

request.interceptors.response.use(
  (response) => {
    const data = response.data;
    if (data && typeof data === 'object') {
      return normalizeResponse(data) as unknown;
    }
    return data;
  },
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/shop/login';
    }
    return Promise.reject(error);
  },
);

export default request;
