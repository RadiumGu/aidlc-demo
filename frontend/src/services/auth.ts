import request from './request';
import type { Result, LoginRequest, RegisterRequest, TokenResponse, UserResponse } from '../types/api';

export const authApi = {
  login: (data: LoginRequest) =>
    request.post<unknown, Result<TokenResponse>>('/auth/login', data),

  register: (data: RegisterRequest) =>
    request.post<unknown, Result<UserResponse>>('/auth/register', data),

  logout: () =>
    request.post<unknown, Result<void>>('/auth/logout'),

  getCurrentUser: () =>
    request.get<unknown, Result<UserResponse>>('/users/me'),
};
