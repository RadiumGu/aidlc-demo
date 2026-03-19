import request from './request';
import type { Result, PageResult, PointBalanceResponse, PointTransactionResponse } from '../types/api';

export const pointsApi = {
  getBalance: () =>
    request.get<unknown, Result<PointBalanceResponse>>('/points/balance'),

  getTransactions: (params: { page?: number; size?: number }) =>
    request.get<unknown, Result<PageResult<PointTransactionResponse>>>('/points/transactions', {
      params: { ...params, page: params.page != null ? params.page - 1 : undefined },
    }),
};
