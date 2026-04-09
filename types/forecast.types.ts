export interface Forecast {
  id: string;
  productId: string;
  storeId: string;
  productName: string;
  productCategory: string;
  currentStock: number;
  reorderLevel: number;
  unit: string;
  supplierName?: string;
  supplierPhone?: string;
  forecast7d: number;
  forecast14d: number;
  forecast30d: number;
  restockNow: boolean;
  recommendedQty: number;
  bestReorderDay: string;
  seasonalNote?: string;
  confidence: "Low" | "Medium" | "High";
  reasoning: string;
  generatedAt: string;
}
