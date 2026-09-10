import type { Express, Request, Response } from "express";
import { and, asc, eq, gte, sql } from "drizzle-orm";
import { getDb } from "./db";
import { customers, products, purchases } from "../drizzle/schema";
import { DISCOUNT_CODE, DISCOUNT_RATE, MANAGERS, MANAGER_PASSWORD, TINTS, discountedPrice, titleCase } from "../client/src/lib/constants";
import { IMAGE_LIBRARY, matchLibraryImage } from "../client/src/lib/imageLibrary";

const SEED_PRODUCTS = [
  { name: "Milk", price: 20, stock: 50, image: "/manus-storage/milk_4cb36e28.jpg", tint: "#D6E6F8" },
  { name: "Rice", price: 12, stock: 30, image: "/manus-storage/rice_7d70daf5.jpg", tint: "#FCEBB8" },
  { name: "Chips", price: 10, stock: 12, image: "/manus-storage/chips_47eafbae.jpg", tint: "#FFE0CC" },
  { name: "Ice Cream", price: 5, stock: 20, image: "/manus-storage/icecream_025b36c7.jpg", tint: "#FBD3E6" },
  { name: "Pepsi", price: 35, stock: 10, image: "/manus-storage/pepsi_f29c0c91.jpg", tint: "#CFDBFA" },
  { name: "Chocolate", price: 30, stock: 10, image: "/manus-storage/chocolate_d651869c.jpg", tint: "#E4D9F7" },
  { name: "Orange Juice", price: 18, stock: 24, image: "/manus-storage/juice_92ff4510.jpg", tint: "#FDE2C8" },
  { name: "Fresh Bread", price: 14, stock: 18, image: "/manus-storage/bread_4e033e4e.jpg", tint: "#F6E7C8" },
  { name: "Farm Eggs", price: 22, stock: 16, image: "/manus-storage/eggs_3b9cc38c.jpg", tint: "#E9F2E2" },
  { name: "Fruit Basket", price: 28, stock: 14, image: "/manus-storage/fruits_ceb7424e.jpg", tint: "#FFE4D6" },
];
const DEFAULT_PRODUCT_IMAGE = "/manus-storage/generic-product_a2031293.jpg";

const money = (value: number) => `$${value.toFixed(2)}`;
const round2 = (value: number) => Math.round(value * 100) / 100;
const jsonError = (res: Response, status: number, error: string) => res.status(status).json({ error });

async function ensureSeeded() {
  const db = await getDb();
  if (!db) throw new Error("Database is not configured");
  const rows = await db.select({ id: products.id }).from(products).limit(1);
  if (rows.length === 0) {
    for (const product of SEED_PRODUCTS) await db.insert(products).values(product);
  }
  return db;
}

export function registerSupermarketRoutes(app: Express) {
  app.get("/api/health", async (_req, res) => {
    try { await getDb(); res.json({ ok: true, service: "freshmart" }); }
    catch { res.status(500).json({ ok: false }); }
  });

  app.get("/api/products", async (_req, res) => {
    try { const db = await ensureSeeded(); res.json({ products: await db.select().from(products).orderBy(asc(products.id)) }); }
    catch (error) { console.error("Products GET failed", error); jsonError(res, 500, "Couldn't reach the stockroom"); }
  });

  app.post("/api/customers", async (req, res) => {
    const name = titleCase(String(req.body?.name ?? "").trim());
    const balance = Number(req.body?.balance);
    if (!name) return jsonError(res, 400, "Please tell us your name first");
    if (!Number.isFinite(balance) || balance < 0) return jsonError(res, 400, "Balance must be zero or more");
    try {
      const db = await getDb(); if (!db) throw new Error("Database unavailable");
      const result = await db.insert(customers).values({ name, balance });
      const [customer] = await db.select().from(customers).where(eq(customers.id, Number(result[0].insertId))).limit(1);
      res.status(201).json({ customer });
    } catch (error) { console.error("Customer POST failed", error); jsonError(res, 500, "Login failed"); }
  });

  app.post("/api/products", async (req, res) => {
    const manager = String(req.body?.manager ?? "").trim();
    if (!MANAGERS.some((entry) => entry.toLowerCase() === manager.toLowerCase()) || req.body?.password !== MANAGER_PASSWORD) return jsonError(res, 403, "Only managers can access!");
    const cleanName = titleCase(String(req.body?.name ?? "").trim());
    const price = Number(req.body?.price); const stock = Number(req.body?.stock);
    if (!cleanName) return jsonError(res, 400, "Product name is required");
    if (!Number.isFinite(price) || price <= 0) return jsonError(res, 400, "Price must be a positive number");
    if (!Number.isInteger(stock) || stock < 0) return jsonError(res, 400, "Stock must be a whole number (0 or more)");
    const manualPick = IMAGE_LIBRARY.find((entry) => entry.src === req.body?.image);
    let image = manualPick?.src ?? null; let tint = manualPick?.tint ?? TINTS[Math.floor(Math.random() * TINTS.length)]; let matched: "manual" | "existing" | "library" | null = manualPick ? "manual" : null; let matchedLabel = manualPick?.label ?? null;
    try {
      const db = await getDb(); if (!db) throw new Error("Database unavailable");
      const [existing] = await db.select().from(products).where(sql`lower(${products.name}) = ${cleanName.toLowerCase()}`).limit(1);
      if (!manualPick && existing?.image) { image = existing.image; tint = existing.tint; matched = "existing"; matchedLabel = existing.name; }
      else if (!manualPick) { const hit = matchLibraryImage(cleanName); if (hit) { image = hit.src; tint = hit.tint; matched = "library"; matchedLabel = hit.label; } }
      if (!image) { image = DEFAULT_PRODUCT_IMAGE; matchedLabel = "FreshMart default"; }
      const result = await db.insert(products).values({ name: cleanName, price, stock, image, tint });
      const [product] = await db.select().from(products).where(eq(products.id, Number(result[0].insertId))).limit(1);
      res.status(201).json({ product, matched, matchedLabel });
    } catch (error) { console.error("Product POST failed", error); jsonError(res, 500, "Couldn't add product"); }
  });

  app.patch("/api/products/:id/stock", async (req, res) => {
    const manager = String(req.body?.manager ?? "").trim();
    if (!MANAGERS.some((entry) => entry.toLowerCase() === manager.toLowerCase()) || req.body?.password !== MANAGER_PASSWORD) return jsonError(res, 403, "Only managers can access!");
    const stock = Number(req.body?.stock);
    if (!Number.isInteger(stock) || stock < 0) return jsonError(res, 400, "Stock must be a whole number (0 or more)");
    try {
      const db = await getDb(); if (!db) throw new Error("Database unavailable");
      await db.update(products).set({ stock }).where(eq(products.id, Number(req.params.id)));
      const [product] = await db.select().from(products).where(eq(products.id, Number(req.params.id))).limit(1);
      if (!product) return jsonError(res, 404, "Product not found");
      res.json({ product });
    } catch (error) { console.error("Stock PATCH failed", error); jsonError(res, 500, "Couldn't update stock"); }
  });

  app.patch("/api/products/:id/offer", async (req, res) => {
    const manager = String(req.body?.manager ?? "").trim();
    if (!MANAGERS.some((entry) => entry.toLowerCase() === manager.toLowerCase()) || req.body?.password !== MANAGER_PASSWORD) return jsonError(res, 403, "Only managers can access!");
    const discountPercent = Number(req.body?.discountPercent);
    if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 90) return jsonError(res, 400, "Discount must be between 0% and 90%");
    try {
      const db = await getDb(); if (!db) throw new Error("Database unavailable");
      await db.update(products).set({ discountPercent }).where(eq(products.id, Number(req.params.id)));
      const [product] = await db.select().from(products).where(eq(products.id, Number(req.params.id))).limit(1);
      if (!product) return jsonError(res, 404, "Product not found");
      res.json({ product });
    } catch (error) { console.error("Offer PATCH failed", error); jsonError(res, 500, "Couldn't update discount"); }
  });

  app.delete("/api/products/:id", async (req, res) => {
    const manager = String(req.body?.manager ?? "").trim();
    if (!MANAGERS.some((entry) => entry.toLowerCase() === manager.toLowerCase()) || req.body?.password !== MANAGER_PASSWORD) return jsonError(res, 403, "Only managers can access!");
    try {
      const db = await getDb(); if (!db) throw new Error("Database unavailable");
      await db.delete(products).where(eq(products.id, Number(req.params.id)));
      res.json({ success: true as const });
    } catch (error) { console.error("Product DELETE failed", error); jsonError(res, 500, "Couldn't drop product"); }
  });

  app.post("/api/checkout", async (req, res) => {
    const customerId = Number(req.body?.customerId); const rawItems = Array.isArray(req.body?.items) ? req.body.items : [];
    const items = rawItems.map((item: { productId?: number; qty?: number }) => ({ productId: Number(item.productId), qty: Number(item.qty) })).filter((item: { productId: number; qty: number }) => Number.isInteger(item.productId) && Number.isInteger(item.qty) && item.qty > 0);
    if (!Number.isInteger(customerId)) return jsonError(res, 400, "Please log in before checking out");
    if (items.length === 0) return jsonError(res, 400, "Your basket is empty");
    const code = String(req.body?.discountCode ?? "").trim();
    if (code && code !== DISCOUNT_CODE) return jsonError(res, 400, "That code isn't valid… maybe take the quiz?");
    try {
      const db = await getDb(); if (!db) throw new Error("Database unavailable");
      const result = await db.transaction(async (tx) => {
        const [customer] = await tx.select().from(customers).where(eq(customers.id, customerId));
        if (!customer) throw new Error("Customer not found — please log in again");
        const lines: { name: string; qty: number; unitPrice: number; lineTotal: number }[] = []; let subtotal = 0;
        for (const item of items) { const [product] = await tx.select().from(products).where(eq(products.id, item.productId)); if (!product) throw new Error("A product in your basket is no longer on the shelf"); if (product.stock < item.qty) throw new Error(`Sorry, only ${product.stock} of ${product.name} left in stock`); const salePrice = discountedPrice(product.price, product.discountPercent); const lineTotal = round2(salePrice * item.qty); subtotal = round2(subtotal + lineTotal); lines.push({ name: product.name, qty: item.qty, unitPrice: salePrice, lineTotal }); }
        const discount = round2(subtotal * (code ? DISCOUNT_RATE : 0)); const total = round2(subtotal - discount);
        if (customer.balance < total) throw new Error(`Insufficient balance! You need ${money(total)} but have ${money(customer.balance)}`);
        for (const item of items) await tx.update(products).set({ stock: sql`${products.stock} - ${item.qty}` }).where(and(eq(products.id, item.productId), gte(products.stock, item.qty)));
        await tx.update(customers).set({ balance: sql`${customers.balance} - ${total}` }).where(and(eq(customers.id, customerId), gte(customers.balance, total)));
        const [updatedCustomer] = await tx.select().from(customers).where(eq(customers.id, customerId));
        for (const line of lines) await tx.insert(purchases).values({ customerId, productName: line.name, quantity: line.qty, unitPrice: line.unitPrice, lineTotal: line.lineTotal, discount });
        return { receipt: { lines, subtotal, discount, total, remainingBalance: round2(updatedCustomer.balance), placedAt: new Date().toISOString() }, customer: updatedCustomer };
      });
      res.json(result);
    } catch (error) { console.error("Checkout failed", error); jsonError(res, 400, error instanceof Error ? error.message : "Checkout failed — please try again"); }
  });
}

export type SupermarketRequest = Request;
