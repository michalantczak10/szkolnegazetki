// Cart and Product Types
export type ProductId = "drobiowa" | "wieprzowa";

export interface CartItem {
  name: string;
  price: number;
  qty: number;
  image?: string;
}

export interface ParcelLocker {
  code: string;
  name: string;
  address: string;
}

export interface DeliveryInfo {
  finalCost: number;
  numberOfParcels: number;
}

export interface OrderConfirmationData {
  orderRef?: string;
  orderId?: string;
  status?: string;
  orderTotal?: string;
  total?: string;
  transferTitle?: string;
  paymentTarget?: string;
  accountCreated?: boolean;
}

export interface OrderData {
  items: Array<{ name: string; price: number; qty: number }>;
  phone: string;
  parcelLockerCode: string;
  paymentMethod: string;
  productsTotal: number;
  deliveryCost: number;
  total: number;
  notes: string;
  createOptionalAccount: boolean;
  optionalAccountEmail: string;
  optionalAccountPassword: string;
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}

export interface UserOrderSummary {
  id: string;
  orderRef: string;
  createdAt: string;
  total: number;
  status: string;
  paymentStatus: string;
  items: Array<{ name: string; price: number; qty: number }>;
}

export interface UserOrdersResponse {
  success: boolean;
  count: number;
  orders: UserOrderSummary[];
}

export type ToastVariant = "success" | "warning" | "info";
