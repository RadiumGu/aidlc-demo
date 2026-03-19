import { create } from 'zustand';
import { productApi } from '../services/product';
import type { ProductResponse, CategoryTreeNode } from '../types/api';

interface ProductState {
  products: ProductResponse[];
  total: number;
  page: number;
  loading: boolean;
  categories: CategoryTreeNode[];
  fetchProducts: (params?: { page?: number; size?: number; categoryId?: number; keyword?: string }) => Promise<void>;
  fetchCategories: () => Promise<void>;
}

export const useProductStore = create<ProductState>()((set) => ({
  products: [],
  total: 0,
  page: 1,
  loading: false,
  categories: [],

  fetchProducts: async (params) => {
    set({ loading: true });
    try {
      const res = await productApi.getProducts(params ?? {});
      set({ products: res.data.records, total: res.data.total, page: res.data.current });
    } finally {
      set({ loading: false });
    }
  },

  fetchCategories: async () => {
    const res = await productApi.getCategoryTree();
    set({ categories: res.data });
  },
}));
