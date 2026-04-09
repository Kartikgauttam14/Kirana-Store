import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { Store } from "@/types/store.types";

interface ActiveStoreState {
  activeStore: Store | null;
  stores: Store[];
  setActiveStore: (store: Store) => void;
  setStores: (stores: Store[]) => void;
}

export const useActiveStoreStore = create<ActiveStoreState>()(
  persist(
    (set) => ({
      activeStore: null,
      stores: [],
      setActiveStore: (store) => set({ activeStore: store }),
      setStores: (stores) =>
        set((s) => ({
          stores,
          activeStore:
            s.activeStore
              ? stores.find((st) => st.id === s.activeStore!.id) ?? stores[0] ?? null
              : stores[0] ?? null,
        })),
    }),
    {
      name: "kirana-active-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
