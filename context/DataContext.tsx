import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import { Bill } from "@/types/billing.types";
import { Forecast } from "@/types/forecast.types";
import { Product } from "@/types/inventory.types";
import { Order } from "@/types/order.types";
import { Store } from "@/types/store.types";

interface DataContextType {
  // Stores
  stores: Store[];
  activeStore: Store | null;
  setActiveStore: (store: Store) => void;
  addStore: (store: Store) => void;
  updateStore: (id: string, updates: Partial<Store>) => void;

  // Products
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductsForStore: (storeId: string) => Product[];

  // Bills
  bills: Bill[];
  addBill: (bill: Bill) => void;
  getBillsForStore: (storeId: string) => Bill[];

  // Forecasts
  forecasts: Forecast[];
  setForecasts: (forecasts: Forecast[]) => void;
  getForecastsForStore: (storeId: string) => Forecast[];

  // Orders
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order["status"]) => void;

  // Analytics helper
  getDailySales: (storeId: string, days: number) => Array<{ date: string; total: number }>;

  isLoading: boolean;
}

const DataContext = createContext<DataContextType | null>(null);

const STORAGE_KEY = "kiranaai_data";

interface PersistedData {
  stores: Store[];
  activeStoreId: string | null;
  products: Product[];
  bills: Bill[];
  forecasts: Forecast[];
  orders: Order[];
}

const DEMO_STORE: Store = {
  id: "store_1",
  ownerId: "owner_1",
  name: "Sharma General Store",
  gstNumber: "07AABCU9603R1ZX",
  fssaiNumber: "12345678901234",
  phone: "9876543210",
  latitude: 28.6139,
  longitude: 77.2090,
  address: "Shop No. 5, Main Market",
  city: "New Delhi",
  pincode: "110001",
  deliveryRadius: 3,
  minOrderValue: 100,
  openTime: "08:00",
  closeTime: "22:00",
  isOpen: true,
  isActive: true,
  rating: 4.5,
  totalRatings: 123,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const DEMO_PRODUCTS: Product[] = [
  {
    id: "prod_1", storeId: "store_1", name: "Basmati Rice", nameHindi: "बासमती चावल",
    category: "grains", sku: "GR001", unit: "kg", costPrice: 75, sellingPrice: 95,
    currentStock: 50, reorderLevel: 20, reorderQty: 50, gstRate: 5, isActive: true,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "prod_2", storeId: "store_1", name: "Toor Dal", nameHindi: "तुअर दाल",
    category: "grains", sku: "GR002", unit: "kg", costPrice: 120, sellingPrice: 145,
    currentStock: 8, reorderLevel: 10, reorderQty: 25, gstRate: 5, isActive: true,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "prod_3", storeId: "store_1", name: "Amul Butter 500g", nameHindi: "अमूल मक्खन",
    category: "dairy", sku: "DA001", unit: "packet", costPrice: 230, sellingPrice: 260,
    currentStock: 15, reorderLevel: 10, reorderQty: 20, gstRate: 12, isActive: true,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "prod_4", storeId: "store_1", name: "Maggi Noodles 70g", nameHindi: "मैगी नूडल्स",
    category: "snacks", sku: "SN001", unit: "packet", costPrice: 12, sellingPrice: 15,
    currentStock: 0, reorderLevel: 20, reorderQty: 50, gstRate: 12, isActive: true,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "prod_5", storeId: "store_1", name: "MDH Chana Masala 100g", nameHindi: "चना मसाला",
    category: "spices", sku: "SP001", unit: "packet", costPrice: 35, sellingPrice: 45,
    currentStock: 30, reorderLevel: 15, reorderQty: 30, gstRate: 5, isActive: true,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "prod_6", storeId: "store_1", name: "Fortune Sunflower Oil 1L", nameHindi: "सूरजमुखी तेल",
    category: "oil", sku: "OL001", unit: "litre", costPrice: 110, sellingPrice: 130,
    currentStock: 25, reorderLevel: 10, reorderQty: 20, gstRate: 5, isActive: true,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  {
    id: "prod_7", storeId: "store_1", name: "Parle-G Biscuits 100g", nameHindi: "पार्ले-जी बिस्किट",
    category: "snacks", sku: "SN002", unit: "packet", costPrice: 6, sellingPrice: 10,
    currentStock: 5, reorderLevel: 30, reorderQty: 100, gstRate: 12, isActive: true,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
];

const generateDemoBills = (): Bill[] => {
  const bills: Bill[] = [];
  const paymentModes: Array<"CASH" | "UPI" | "CARD" | "CREDIT"> = ["CASH", "UPI", "CASH", "UPI", "CREDIT"];
  for (let i = 0; i < 10; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    bills.push({
      id: `bill_${i}`,
      storeId: "store_1",
      billNumber: `KA${(100 + i).toString()}`,
      customerName: i % 3 === 0 ? "Ramesh Kumar" : undefined,
      subtotal: 200 + i * 50,
      gstTotal: 15 + i * 3,
      discount: 0,
      grandTotal: 215 + i * 53,
      paymentMode: paymentModes[i % 5],
      isPaid: i !== 2,
      items: [
        {
          id: `bi_${i}_1`, productId: "prod_1", productName: "Basmati Rice",
          quantity: 2, unit: "kg", unitPrice: 95, gstRate: 5, gstAmount: 9, totalPrice: 200,
        },
      ],
      createdAt: date.toISOString(),
    });
  }
  return bills;
};

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [stores, setStores] = useState<Store[]>([DEMO_STORE]);
  const [activeStore, setActiveStoreState] = useState<Store | null>(DEMO_STORE);
  const [products, setProducts] = useState<Product[]>(DEMO_PRODUCTS);
  const [bills, setBills] = useState<Bill[]>(generateDemoBills());
  const [forecasts, setForecastsState] = useState<Forecast[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const data: PersistedData = JSON.parse(raw);
          if (data.stores?.length) setStores(data.stores);
          if (data.products?.length) setProducts(data.products);
          if (data.bills?.length) setBills(data.bills);
          if (data.forecasts?.length) setForecastsState(data.forecasts);
          if (data.orders?.length) setOrders(data.orders);
          if (data.activeStoreId && data.stores?.length) {
            const active = data.stores.find((s) => s.id === data.activeStoreId);
            if (active) setActiveStoreState(active);
          }
        }
      } catch (_) {
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const persist = useCallback(
    async (data: Partial<PersistedData>) => {
      try {
        const existing = await AsyncStorage.getItem(STORAGE_KEY);
        const current: PersistedData = existing ? JSON.parse(existing) : {};
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ ...current, ...data })
        );
      } catch (_) {}
    },
    []
  );

  const setActiveStore = useCallback((store: Store) => {
    setActiveStoreState(store);
    persist({ activeStoreId: store.id });
  }, [persist]);

  const addStore = useCallback((store: Store) => {
    setStores((prev) => {
      const updated = [...prev, store];
      persist({ stores: updated });
      return updated;
    });
  }, [persist]);

  const updateStore = useCallback((id: string, updates: Partial<Store>) => {
    setStores((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
      persist({ stores: updated });
      return updated;
    });
  }, [persist]);

  const addProduct = useCallback((product: Product) => {
    setProducts((prev) => {
      const updated = [...prev, product];
      persist({ products: updated });
      return updated;
    });
  }, [persist]);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
      persist({ products: updated });
      return updated;
    });
  }, [persist]);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      persist({ products: updated });
      return updated;
    });
  }, [persist]);

  const getProductsForStore = useCallback(
    (storeId: string) => products.filter((p) => p.storeId === storeId && p.isActive),
    [products]
  );

  const addBill = useCallback((bill: Bill) => {
    setBills((prev) => {
      const updated = [bill, ...prev];
      persist({ bills: updated });
      return updated;
    });
  }, [persist]);

  const getBillsForStore = useCallback(
    (storeId: string) => bills.filter((b) => b.storeId === storeId),
    [bills]
  );

  const setForecasts = useCallback((f: Forecast[]) => {
    setForecastsState(f);
    persist({ forecasts: f });
  }, [persist]);

  const getForecastsForStore = useCallback(
    (storeId: string) => forecasts.filter((f) => f.storeId === storeId),
    [forecasts]
  );

  const addOrder = useCallback((order: Order) => {
    setOrders((prev) => {
      const updated = [order, ...prev];
      persist({ orders: updated });
      return updated;
    });
  }, [persist]);

  const updateOrderStatus = useCallback((id: string, status: Order["status"]) => {
    setOrders((prev) => {
      const updated = prev.map((o) =>
        o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o
      );
      persist({ orders: updated });
      return updated;
    });
  }, [persist]);

  const getDailySales = useCallback(
    (storeId: string, days: number) => {
      const storeBills = bills.filter((b) => b.storeId === storeId);
      const result: Array<{ date: string; total: number }> = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const dayBills = storeBills.filter(
          (b) => b.createdAt.split("T")[0] === dateStr
        );
        const total = dayBills.reduce((sum, b) => sum + b.grandTotal, 0);
        result.push({
          date: d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
          total,
        });
      }
      return result;
    },
    [bills]
  );

  return (
    <DataContext.Provider
      value={{
        stores, activeStore, setActiveStore, addStore, updateStore,
        products, addProduct, updateProduct, deleteProduct, getProductsForStore,
        bills, addBill, getBillsForStore,
        forecasts, setForecasts, getForecastsForStore,
        orders, addOrder, updateOrderStatus,
        getDailySales,
        isLoading,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
