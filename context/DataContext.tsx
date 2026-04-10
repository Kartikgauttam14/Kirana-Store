import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import { Bill } from "@/types/billing.types";
import { Forecast } from "@/types/forecast.types";
import { Product } from "@/types/inventory.types";
import { Order } from "@/types/order.types";
import { Store } from "@/types/store.types";
import { supabase } from "@/lib/supabase";
import { isSupabaseReady } from "@/lib/supabase";
import { enqueueMutation, processSyncQueue } from "@/lib/syncQueue";

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
        // 1. Load local cache first (instant boot)
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

      // 2. Background: Attempt cloud hydration from Supabase
      try {
        const { data: cloudProducts, error: pErr } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false });

        if (!pErr && cloudProducts && cloudProducts.length > 0) {
          const mapped: Product[] = cloudProducts.map((p: any) => ({
            id: p.id,
            storeId: p.store_id,
            name: p.name,
            nameHindi: p.name_hindi,
            category: p.category,
            sku: p.sku,
            barcode: p.barcode,
            unit: p.unit,
            costPrice: p.cost_price,
            sellingPrice: p.selling_price,
            currentStock: p.current_stock,
            reorderLevel: p.reorder_level,
            reorderQty: p.reorder_qty,
            gstRate: p.gst_rate,
            supplierName: p.supplier_name,
            supplierPhone: p.supplier_phone,
            isActive: p.is_active ?? true,
            createdAt: p.created_at,
            updatedAt: p.updated_at,
          }));
          setProducts((local) => {
            // Merge: cloud records win for same ID, keep local-only entries
            const cloudIds = new Set(mapped.map((p) => p.id));
            const localOnly = local.filter((p) => !cloudIds.has(p.id));
            return [...mapped, ...localOnly];
          });
          console.log(`[Sync] Hydrated ${cloudProducts.length} products from Supabase`);
        }

        const { data: cloudOrders, error: oErr } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);

        if (!oErr && cloudOrders && cloudOrders.length > 0) {
          setOrders((local) => {
            const cloudIds = new Set(cloudOrders.map((o: any) => o.id));
            const localOnly = local.filter((o) => !cloudIds.has(o.id));
            const mapped = cloudOrders.map((o: any) => ({
              id: o.id,
              customerId: o.customer_id,
              storeId: o.store_id,
              storeName: "",
              orderNumber: o.id?.slice(-6) ?? "",
              status: o.status,
              deliveryAddress: o.delivery_address ?? "",
              subtotal: o.total_amount,
              deliveryFee: 0,
              discount: 0,
              grandTotal: o.total_amount,
              paymentMode: o.payment_mode ?? "UPI",
              isPaid: true,
              items: o.items ?? [],
              createdAt: o.created_at,
              updatedAt: o.updated_at,
            }));
            return [...mapped, ...localOnly];
          });
          console.log(`[Sync] Hydrated ${cloudOrders.length} orders from Supabase`);
        }
      } catch (syncErr) {
        // Graceful failure — app works fine with local cache
        console.log("[Sync] Cloud hydration skipped (offline or not configured):", syncErr);
      }

      // 3. Process any queued mutations from previous failed syncs
      if (isSupabaseReady) {
        processSyncQueue().then((count) => {
          if (count > 0) console.log(`[SyncQueue] Replayed ${count} pending mutations`);
        });
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

      supabase.from("stores").insert({
        id: store.id,
        owner_id: store.ownerId,
        name: store.name,
        phone: store.phone,
        gst_number: store.gstNumber,
        fssai_number: store.fssaiNumber,
        latitude: store.latitude,
        longitude: store.longitude,
        address: store.address,
        city: store.city,
        pincode: store.pincode,
        delivery_radius: store.deliveryRadius,
        min_order_value: store.minOrderValue,
        open_time: store.openTime,
        close_time: store.closeTime,
        is_open: store.isOpen,
        is_active: store.isActive,
      }).then(({ error }) => {
         if (error) console.log("Supabase Store Add Error:", error);
      });

      return updated;
    });
  }, [persist]);

  const updateStore = useCallback((id: string, updates: Partial<Store>) => {
    setStores((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
      persist({ stores: updated });

      // Dual-write: Push store updates to Supabase
      const payload: Record<string, unknown> = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.phone !== undefined) payload.phone = updates.phone;
      if (updates.address !== undefined) payload.address = updates.address;
      if (updates.city !== undefined) payload.city = updates.city;
      if (updates.pincode !== undefined) payload.pincode = updates.pincode;
      if (updates.isOpen !== undefined) payload.is_open = updates.isOpen;
      if (updates.isActive !== undefined) payload.is_active = updates.isActive;
      if (updates.openTime !== undefined) payload.open_time = updates.openTime;
      if (updates.closeTime !== undefined) payload.close_time = updates.closeTime;
      if (updates.deliveryRadius !== undefined) payload.delivery_radius = updates.deliveryRadius;
      if (updates.minOrderValue !== undefined) payload.min_order_value = updates.minOrderValue;

      if (Object.keys(payload).length > 0) {
        supabase.from("stores").update(payload).eq("id", id)
          .then(({ error }) => {
            if (error) console.log("Supabase Sync UpdateStore Error:", error);
          });
      }

      return updated;
    });
  }, [persist]);

  const addProduct = useCallback((product: Product) => {
    setProducts((prev) => {
      const updated = [...prev, product];
      persist({ products: updated });
      // Dual-write: Push to Supabase
      supabase.from("products").insert({
        id: product.id,
        store_id: product.storeId,
        name: product.name,
        name_hindi: product.nameHindi,
        category: product.category,
        sku: product.sku,
        unit: product.unit,
        cost_price: product.costPrice,
        selling_price: product.sellingPrice,
        current_stock: product.currentStock,
        reorder_level: product.reorderLevel,
        reorder_qty: product.reorderQty,
        gst_rate: product.gstRate,
        is_active: product.isActive,
      }).then(({ error }) => {
        if (error) {
          console.log("Supabase Sync AddProduct Error (queued for retry):", error);
          enqueueMutation("products", "insert", {
            id: product.id,
            store_id: product.storeId,
            name: product.name,
            name_hindi: product.nameHindi,
            category: product.category,
            sku: product.sku,
            unit: product.unit,
            cost_price: product.costPrice,
            selling_price: product.sellingPrice,
            current_stock: product.currentStock,
            reorder_level: product.reorderLevel,
            reorder_qty: product.reorderQty,
            gst_rate: product.gstRate,
            is_active: product.isActive,
          });
        }
      });
      return updated;
    });
  }, [persist]);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
      persist({ products: updated });
      
      // Dual-write: Push updates to Supabase
      const payload: Record<string, unknown> = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.nameHindi !== undefined) payload.name_hindi = updates.nameHindi;
      if (updates.costPrice !== undefined) payload.cost_price = updates.costPrice;
      if (updates.sellingPrice !== undefined) payload.selling_price = updates.sellingPrice;
      if (updates.currentStock !== undefined) payload.current_stock = updates.currentStock;
      if (updates.reorderLevel !== undefined) payload.reorder_level = updates.reorderLevel;
      if (updates.reorderQty !== undefined) payload.reorder_qty = updates.reorderQty;
      if (updates.gstRate !== undefined) payload.gst_rate = updates.gstRate;
      if (updates.supplierName !== undefined) payload.supplier_name = updates.supplierName;
      if (updates.supplierPhone !== undefined) payload.supplier_phone = updates.supplierPhone;
      if (updates.isActive !== undefined) payload.is_active = updates.isActive;

      if (Object.keys(payload).length > 0) {
        supabase.from("products").update(payload).eq("id", id)
          .then(({ error }) => {
            if (error) console.log("Supabase Sync UpdateProduct Error:", error);
          });
      }
        
      return updated;
    });
  }, [persist]);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      persist({ products: updated });
      
      // Dual-write: delete from Supabase
      supabase.from("products").delete().eq("id", id)
        .then(({ error }) => {
          if (error) console.log("Supabase Sync DeleteProduct Error:", error);
        });

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
      
      supabase.from("bills").insert({
        id: bill.id,
        store_id: bill.storeId,
        bill_number: bill.billNumber,
        customer_name: bill.customerName,
        customer_phone: bill.customerPhone,
        subtotal: bill.subtotal,
        gst_total: bill.gstTotal,
        discount: bill.discount,
        grand_total: bill.grandTotal,
        payment_mode: bill.paymentMode,
        is_paid: bill.isPaid,
        items: bill.items,
      }).then(({ error }) => {
         if (error) {
           console.log("Supabase Bill Log Error (queued):", error);
           enqueueMutation("bills", "insert", {
             id: bill.id,
             store_id: bill.storeId,
             bill_number: bill.billNumber,
             customer_name: bill.customerName,
             subtotal: bill.subtotal,
             gst_total: bill.gstTotal,
             discount: bill.discount,
             grand_total: bill.grandTotal,
             payment_mode: bill.paymentMode,
             is_paid: bill.isPaid,
             items: bill.items,
           });
         }
      });
      
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

      supabase.from("orders").insert({
        id: order.id,
        store_id: order.storeId,
        customer_id: order.customerId,
        status: order.status,
        total_amount: order.grandTotal,
        delivery_address: order.deliveryAddress,
        payment_mode: order.paymentMode,
        items: order.items,
      }).then(({ error }) => {
         if (error) console.log("Supabase Order Log Error:", error);
      });

      return updated;
    });
  }, [persist]);

  const updateOrderStatus = useCallback((id: string, status: Order["status"]) => {
    setOrders((prev) => {
      const updated = prev.map((o) =>
        o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o
      );
      persist({ orders: updated });

      // Dual-write: Push order status change to Supabase
      supabase.from("orders").update({ status }).eq("id", id)
        .then(({ error }) => {
          if (error) console.log("Supabase Sync UpdateOrderStatus Error:", error);
        });

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
