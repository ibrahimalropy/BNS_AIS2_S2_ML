import type { Customer, Product, Receipt } from "./types";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Something went wrong",
    );
  }
  return data as T;
}

export const api = {
  listProducts: () =>
    request<{ products: Product[] }>("/api/products").then((r) => r.products),

  login: (name: string, balance: number) =>
    request<{ customer: Customer }>("/api/customers", {
      method: "POST",
      body: JSON.stringify({ name, balance }),
    }).then((r) => r.customer),

  addProduct: (payload: {
    manager: string;
    password: string;
    name: string;
    price: number;
    stock: number;
    image?: string;
  }) =>
    request<{
      product: Product;
      matched: "manual" | "existing" | "library" | null;
      matchedLabel: string | null;
    }>("/api/products", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateStock: (payload: { manager: string; password: string; productId: number; stock: number }) =>
    request<{ product: Product }>(`/api/products/${payload.productId}/stock`, {
      method: "PATCH",
      body: JSON.stringify({ manager: payload.manager, password: payload.password, stock: payload.stock }),
    }).then((r) => r.product),

  updateDiscount: (payload: { manager: string; password: string; productId: number; discountPercent: number }) =>
    request<{ product: Product }>(`/api/products/${payload.productId}/offer`, {
      method: "PATCH",
      body: JSON.stringify({ manager: payload.manager, password: payload.password, discountPercent: payload.discountPercent }),
    }).then((r) => r.product),

  deleteProduct: (payload: { manager: string; password: string; productId: number }) =>
    request<{ success: true }>(`/api/products/${payload.productId}`, {
      method: "DELETE",
      body: JSON.stringify({ manager: payload.manager, password: payload.password }),
    }),

  checkout: (payload: {
    customerId: number;
    items: { productId: number; qty: number }[];
    discountCode?: string;
  }) =>
    request<{
      receipt: Omit<Receipt, "customerName">;
      customer: Customer;
    }>("/api/checkout", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
