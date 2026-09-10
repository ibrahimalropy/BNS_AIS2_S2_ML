import { double, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  price: double("price").notNull(),
  discountPercent: double("discountPercent").notNull().default(0),
  stock: int("stock").notNull(),
  image: varchar("image", { length: 500 }),
  tint: varchar("tint", { length: 20 }).notNull().default("#DFF3E4"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  balance: double("balance").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const purchases = mysqlTable("purchases", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  productName: varchar("productName", { length: 160 }).notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: double("unitPrice").notNull(),
  lineTotal: double("lineTotal").notNull(),
  discount: double("discount").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Purchase = typeof purchases.$inferSelect;
