import { pgTable, text, timestamp, real, boolean, uuid, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  phone: text("phone").notNull().unique(),
  name: text("name"),
  role: text("role").notNull(), // 'STORE_OWNER' | 'CUSTOMER'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stores = pgTable("stores", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  gstNumber: text("gst_number"),
  fssaiNumber: text("fssai_number"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  address: text("address"),
  city: text("city"),
  pincode: text("pincode"),
  deliveryRadius: real("delivery_radius").default(3),
  minOrderValue: real("min_order_value").default(0),
  openTime: text("open_time"),
  closeTime: text("close_time"),
  isOpen: boolean("is_open").default(true),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id").references(() => stores.id).notNull(),
  name: text("name").notNull(),
  nameHindi: text("name_hindi"),
  category: text("category").notNull(),
  sku: text("sku").notNull(),
  barcode: text("barcode"),
  unit: text("unit").notNull(),
  costPrice: real("cost_price").notNull(),
  sellingPrice: real("selling_price").notNull(),
  currentStock: real("current_stock").notNull().default(0),
  reorderLevel: real("reorder_level").default(10),
  reorderQty: real("reorder_qty").default(20),
  gstRate: real("gst_rate").default(0),
  supplierName: text("supplier_name"),
  supplierPhone: text("supplier_phone"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const bills = pgTable("bills", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id").references(() => stores.id).notNull(),
  billNumber: text("bill_number").notNull(),
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  subtotal: real("subtotal").notNull(),
  gstTotal: real("gst_total").notNull(),
  discount: real("discount").default(0),
  grandTotal: real("grand_total").notNull(),
  paymentMode: text("payment_mode").notNull(), // 'CASH' | 'UPI' | 'CARD' | 'CREDIT'
  isPaid: boolean("is_paid").default(true),
  items: jsonb("items").notNull(), // To store bill items flexibly for now
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id").references(() => stores.id).notNull(),
  customerId: uuid("customer_id").references(() => users.id).notNull(),
  status: text("status").notNull(), // 'PENDING' | 'ACCEPTED' | 'OUTFORDELIVERY' | 'DELIVERED' | 'CANCELLED'
  totalAmount: real("total_amount").notNull(),
  deliveryAddress: text("delivery_address"),
  paymentMode: text("payment_mode").notNull(),
  items: jsonb("items").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
