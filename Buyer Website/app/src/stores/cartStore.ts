import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  assetId: string;
  title: string;
  licenseType: 'standard' | 'extended';
  price: number;
  previewUrl: string;
  sellerName: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (assetId: string) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((s) => {
          const exists = s.items.find((i) => i.assetId === item.assetId);
          if (exists) return s;
          return { items: [...s.items, item] };
        }),
      removeItem: (assetId) =>
        set((s) => ({ items: s.items.filter((i) => i.assetId !== assetId) })),
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price, 0),
    }),
    {
      name: 'hx-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
