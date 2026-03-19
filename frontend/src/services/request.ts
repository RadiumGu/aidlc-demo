import axios from 'axios';
import type { Result } from '../types/api';

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
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

request.interceptors.response.use(
  (response) => {
    // Backend wraps all responses in Result<T> { code, message, data }
    const result = response.data as Result<unknown>;
    if (result.code && result.code !== '0' && result.code !== '200' && result.code !== 'SUCCESS') {
      return Promise.reject(new Error(result.message || '请求失败'));
    }
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    // Try to extract backend error message
    const msg = error.response?.data?.message || error.message || '网络错误';
    return Promise.reject(new Error(msg));
  },
);

export default request;
