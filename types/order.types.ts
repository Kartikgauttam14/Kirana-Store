export type OrderStatus = "PLACED" | "CONFIRMED" | "PACKED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  customerId: string;
  storeId: string;
  storeName: string;
  orderNumber: string;
  status: OrderStatus;
  deliveryAddress: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  grandTotal: number;
  paymentMode: string;
  isPaid: boolean;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}
