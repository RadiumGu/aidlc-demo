import { create } from 'zustand';
import { orderApi } from '../services/order';
import type { OrderResponse } from '../types/api';

interface OrderState {
  orders: OrderResponse[];
  total: number;
  loading: boolean;
  fetchOrders: (params?: { page?: number; size?: number }) => Promise<void>;
}

export const useOrderStore = create<OrderState>()((set) => ({
  orders: [],
  total: 0,
  loading: false,

  fetchOrders: async (params) => {
    set({ loading: true });
    try {
      const res = await orderApi.getMyOrders(params ?? {});
      set({ orders: res.data.records, total: res.data.total });
    } finally {
      set({ loading: false });
    }
  },
}));
