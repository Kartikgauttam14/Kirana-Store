import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { User } from "@/types/store.types";

interface AuthState {
  token: string | null;
  user: User | null;
  role: "STORE_OWNER" | "CUSTOMER" | null;
  language: "en" | "hi";
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  setLanguage: (lang: "en" | "hi") => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      role: null,
      language: "en",
      setAuth: (token, user) =>
        set({ token, user, role: user.role as "STORE_OWNER" | "CUSTOMER" }),
      logout: () => set({ token: null, user: null, role: null }),
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: "kirana-auth",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
