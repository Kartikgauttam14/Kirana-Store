import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { Bill, CartItem, PaymentMode } from "@/types/billing.types";

interface PendingBill {
  id: string;
  storeId: string;
  items: CartItem[];
  customerName?: string;
  customerPhone?: string;
  paymentMode: PaymentMode;
  discount: number;
  createdAt: string;
  synced: boolean;
}

interface BillingState {
  bills: Bill[];
  pendingBills: PendingBill[];
  setBills: (bills: Bill[]) => void;
  addBill: (bill: Bill) => void;
  addPendingBill: (bill: PendingBill) => void;
  markSynced: (id: string) => void;
}

export const useBillingStore = create<BillingState>()(
  persist(
    (set) => ({
      bills: [],
      pendingBills: [],
      setBills: (bills) => set({ bills }),
      addBill: (bill) => set((s) => ({ bills: [bill, ...s.bills] })),
      addPendingBill: (bill) =>
        set((s) => ({ pendingBills: [...s.pendingBills, bill] })),
      markSynced: (id) =>
        set((s) => ({
          pendingBills: s.pendingBills.map((b) =>
            b.id === id ? { ...b, synced: true } : b
          ),
        })),
    }),
    {
      name: "kirana-billing",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
