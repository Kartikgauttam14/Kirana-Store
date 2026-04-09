import { create } from "zustand";

import { CartItem } from "@/types/billing.types";

interface CartState {
  items: CartItem[];
  storeId: string | null;
  storeName: string | null;
  addItem: (item: CartItem, storeId: string, storeName: string) => "added" | "store_conflict";
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  storeId: null,
  storeName: null,
  addItem: (item, storeId, storeName) => {
    const state = get();
    if (state.storeId && state.storeId !== storeId) {
      return "store_conflict";
    }
    set((s) => {
      const existing = s.items.find((i) => i.productId === item.productId);
      if (existing) {
        return {
          items: s.items.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
          storeId,
          storeName,
        };
      }
      return { items: [...s.items, { ...item, quantity: 1 }], storeId, storeName };
    });
    return "added";
  },
  removeItem: (id) =>
    set((s) => ({
      items: s.items.filter((i) => i.productId !== id),
    })),
  updateQty: (id, qty) =>
    set((s) => ({
      items:
        qty <= 0
          ? s.items.filter((i) => i.productId !== id)
          : s.items.map((i) =>
              i.productId === id ? { ...i, quantity: qty } : i
            ),
    })),
  clearCart: () => set({ items: [], storeId: null, storeName: null }),
  getTotal: () =>
    get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
