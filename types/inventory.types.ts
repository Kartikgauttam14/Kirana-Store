export interface Product {
  id: string;
  storeId: string;
  name: string;
  nameHindi?: string;
  category: string;
  sku: string;
  barcode?: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  reorderLevel: number;
  reorderQty: number;
  gstRate: number;
  hsnCode?: string;
  imageUrl?: string;
  expiryDate?: string;
  supplierName?: string;
  supplierPhone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  storeId: string;
  type: "IN" | "OUT";
  quantity: number;
  reason: "PURCHASE" | "DAMAGE" | "THEFT" | "EXPIRY" | "CORRECTION" | "RETURN";
  notes?: string;
  createdAt: string;
}

export type StockStatus = "inStock" | "lowStock" | "outOfStock";

export function getStockStatus(product: Product): StockStatus {
  if (product.currentStock <= 0) return "outOfStock";
  if (product.currentStock <= product.reorderLevel) return "lowStock";
  return "inStock";
}
