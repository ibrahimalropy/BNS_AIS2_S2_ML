export interface Product {
  id: number;
  name: string;
  price: number;
  discountPercent: number;
  stock: number;
  image: string | null;
  tint: string;
}

export interface Customer {
  id: number;
  name: string;
  balance: number;
}

export interface CartLine {
  product: Product;
  qty: number;
}

export interface ReceiptLine {
  name: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Receipt {
  customerName: string;
  lines: ReceiptLine[];
  subtotal: number;
  discount: number;
  total: number;
  remainingBalance: number;
  placedAt: string;
}

export type ToastTone = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  tone: ToastTone;
}
