"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BadgePercent, Flame, Minus, Package, Plus, ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/types";
import { money } from "@/lib/format";
import { discountedPrice } from "@/lib/constants";

export default function ProductCard({
  product,
  inCart,
  index,
  onAdd,
}: {
  product: Product;
  inCart: number;
  index: number;
  onAdd: (product: Product, qty: number) => void;
}) {
  const [qty, setQty] = useState(1);
  const remaining = Math.max(0, product.stock - inCart);
  const soldOut = product.stock <= 0;
  const fullyInBasket = !soldOut && remaining === 0;
  const hasDiscount = product.discountPercent > 0;
  const salePrice = discountedPrice(product.price, product.discountPercent);

  useEffect(() => {
    if (remaining > 0 && qty > remaining) setQty(remaining);
    if (remaining > 0 && qty < 1) setQty(1);
  }, [remaining, qty]);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: Math.min(index * 0.05, 0.4),
        type: "spring",
        stiffness: 170,
        damping: 20,
      }}
      whileHover={{ y: -6 }}
      className="group relative flex flex-col rounded-[1.75rem] border border-ink/8 bg-paper p-3 shadow-[0_10px_30px_-18px_rgba(33,29,21,0.25)] transition-shadow duration-300 hover:shadow-card"
    >
      <div
        className="relative aspect-[5/4] overflow-hidden rounded-[1.35rem]"
        style={{ backgroundColor: product.tint }}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 group-hover:rotate-1"
          />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center">
            <span className="text-outline absolute font-display text-[7rem] font-extrabold opacity-50">
              {product.name.charAt(0)}
            </span>
            <Package className="relative h-14 w-14 text-ink/35" />
          </div>
        )}

        <div className="absolute top-3 left-3">
          {soldOut ? (
            <span className="rounded-full bg-ink/80 px-3 py-1 text-[11px] font-bold tracking-wide text-cream uppercase backdrop-blur">
              0 left
            </span>
          ) : remaining < 5 ? (
            <span className="flex items-center gap-1 rounded-full bg-tang px-3 py-1 text-[11px] font-bold text-cream uppercase">
              <Flame className="h-3 w-3" />
              Only {remaining} left
            </span>
          ) : (
            <span className="rounded-full bg-white/85 px-3 py-1 text-[11px] font-bold text-ink backdrop-blur">
              {remaining} in stock
            </span>
          )}
        </div>

        {(soldOut || fullyInBasket) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-ink/45 backdrop-blur-[2px]">
            <span
              className="rounded-full bg-berry px-5 py-2.5 font-display text-sm font-extrabold tracking-widest text-cream uppercase shadow-pop"
              style={{ rotate: "-8deg" }}
            >
              {soldOut ? "Sold out" : "All in basket"}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col px-1.5 pt-3.5 pb-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg leading-tight font-bold">
            {product.name}
          </h3>
          <p className="text-right">
            {hasDiscount ? (
              <span className="flex items-center justify-end gap-1 text-xs font-bold text-tang"><BadgePercent className="h-3.5 w-3.5" />-{product.discountPercent}%</span>
            ) : null}
            <span className={`font-display text-xl font-extrabold ${hasDiscount ? "text-tang" : ""}`}>
              {money(salePrice)}
            </span>
            {hasDiscount ? <span className="ml-1 text-xs font-semibold text-ink-soft line-through">{money(product.price)}</span> : null}
            <span className="block text-[10px] font-semibold tracking-wide text-ink-soft uppercase">
              per piece
            </span>
          </p>
        </div>

        <div className="mt-3.5 flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-ink/10 bg-cream p-1">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1 || soldOut}
              aria-label="Decrease quantity"
              className="flex h-7 w-7 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-white disabled:opacity-30"
            >
              <Minus className="h-3.5 w-3.5" />
            </motion.button>
            <span className="w-6 text-center font-display text-sm font-bold tabular-nums">
              {qty}
            </span>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setQty((q) => Math.min(remaining, q + 1))}
              disabled={qty >= remaining || soldOut}
              aria-label="Increase quantity"
              className="flex h-7 w-7 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-white disabled:opacity-30"
            >
              <Plus className="h-3.5 w-3.5" />
            </motion.button>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              onAdd(product, qty);
              setQty(1);
            }}
            disabled={soldOut || fullyInBasket}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ink py-2.5 font-display text-sm font-bold text-cream transition-colors hover:bg-leaf-deep disabled:bg-ink/25"
          >
            <ShoppingBag className="h-4 w-4" />
            Add
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}
