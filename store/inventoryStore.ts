import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { Product } from "@/types/inventory.types";

interface InventoryState {
  products: Product[];
  lastSync: string | null;
  setProducts: (products: Product[]) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  addProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set) => ({
      products: [],
      lastSync: null,
      setProducts: (products) =>
        set({ products, lastSync: new Date().toISOString() }),
      updateProduct: (id, updates) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      addProduct: (product) =>
        set((s) => ({ products: [...s.products, product] })),
      removeProduct: (id) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== id) })),
    }),
    {
      name: "kirana-inventory",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
