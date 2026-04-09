export type PaymentMode = "CASH" | "UPI" | "CARD" | "CREDIT";

export interface BillItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  gstRate: number;
  gstAmount: number;
  totalPrice: number;
}

export interface Bill {
  id: string;
  storeId: string;
  billNumber: string;
  customerName?: string;
  customerPhone?: string;
  subtotal: number;
  gstTotal: number;
  discount: number;
  grandTotal: number;
  paymentMode: PaymentMode;
  isPaid: boolean;
  items: BillItem[];
  createdAt: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  gstRate: number;
  currentStock: number;
}
