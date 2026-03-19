import { create } from 'zustand';
import { pointsApi } from '../services/points';
import type { PointTransactionResponse } from '../types/api';

interface PointsState {
  balance: number;
  transactions: PointTransactionResponse[];
  total: number;
  loading: boolean;
  fetchBalance: () => Promise<void>;
  fetchTransactions: (params?: { page?: number; size?: number }) => Promise<void>;
}

export const usePointsStore = create<PointsState>()((set) => ({
  balance: 0,
  transactions: [],
  total: 0,
  loading: false,

  fetchBalance: async () => {
    const res = await pointsApi.getBalance();
    set({ balance: res.data.balance });
  },

  fetchTransactions: async (params) => {
    set({ loading: true });
    try {
      const res = await pointsApi.getTransactions(params ?? {});
      set({ transactions: res.data.records, total: res.data.total });
    } finally {
      set({ loading: false });
    }
  },
}));
