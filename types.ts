// Cart and Product Types
export type ProductId = "poster" | "newsletter";

export interface CartItem {
  name: string;
  price: number;
  qty: number;
  image?: string;
}

export interface OrderConfirmationData {
  orderRef?: string;
  orderId?: string;
  status?: string;
  total?: number;
  transferTitle?: string;
  paymentTarget?: string;
}

export interface OrderData {
  items: Array<{ name: string; price: number; qty: number }>;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentMethod: string;
  productsTotal: number;
  total: number;
  notes: string;
}

export type ToastVariant = "success" | "warning" | "info";
