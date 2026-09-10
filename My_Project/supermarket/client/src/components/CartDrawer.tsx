"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgePercent,
  Loader2,
  Minus,
  Plus,
  ShoppingBasket,
  Sparkles,
  TicketPercent,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import type { CartLine } from "@/lib/types";
import { money, round2 } from "@/lib/format";
import { DISCOUNT_RATE, discountedPrice } from "@/lib/constants";

export default function CartDrawer({
  open,
  lines,
  balance,
  discountApplied,
  checkingOut,
  onClose,
  onUpdateQty,
  onRemove,
  onApplyCode,
  onRemoveDiscount,
  onOpenQuiz,
  onCheckout,
}: {
  open: boolean;
  lines: CartLine[];
  balance: number;
  discountApplied: boolean;
  checkingOut: boolean;
  onClose: () => void;
  onUpdateQty: (productId: number, qty: number) => void;
  onRemove: (productId: number) => void;
  onApplyCode: (code: string) => void;
  onRemoveDiscount: () => void;
  onOpenQuiz: () => void;
  onCheckout: () => void;
}) {
  const [code, setCode] = useState("");

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const subtotal = round2(
    lines.reduce((sum, line) => sum + discountedPrice(line.product.price, line.product.discountPercent) * line.qty, 0),
  );
  const discount = discountApplied ? round2(subtotal * DISCOUNT_RATE) : 0;
  const total = round2(subtotal - discount);
  const overBudget = total > balance;

  useEffect(() => {
    if (!discountApplied) setCode("");
  }, [discountApplied]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "105%" }}
            animate={{ x: 0 }}
            exit={{ x: "105%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed inset-y-0 right-0 z-[60] flex w-full max-w-md flex-col bg-cream shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-ink/8 px-6 py-5">
              <div>
                <h2 className="font-display text-2xl font-extrabold tracking-tight">
                  Your basket
                </h2>
                <p className="text-sm text-ink-soft">
                  {lines.length === 0
                    ? "Nothing in here yet"
                    : `${lines.reduce((s, l) => s + l.qty, 0)} item${
                        lines.reduce((s, l) => s + l.qty, 0) === 1 ? "" : "s"
                      } picked`}
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 bg-paper transition-colors hover:bg-peach"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-ink/20 bg-paper">
                  <ShoppingBasket className="h-12 w-12 text-ink/30" />
                </div>
                <p className="font-display text-xl font-bold">
                  Your basket is empty
                </p>
                <p className="-mt-2 text-sm text-ink-soft">
                  The shelves are full and your balance is ready. Go grab
                  something tasty.
                </p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="mt-2 rounded-full bg-ink px-6 py-3 font-display font-bold text-cream transition-colors hover:bg-leaf-deep"
                >
                  Browse the shelves
                </motion.button>
              </div>
            ) : (
              <>
                <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-6 py-5">
                  <AnimatePresence initial={false}>
                    {lines.map((line) => (
                      <motion.div
                        key={line.product.id}
                        layout
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 28,
                        }}
                        className="flex items-center gap-3 overflow-hidden rounded-3xl border border-ink/8 bg-paper p-3"
                      >
                        <div
                          className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl"
                          style={{ backgroundColor: line.product.tint }}
                        >
                          {line.product.image ? (
                            <img
                              src={line.product.image}
                              alt={line.product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center font-display text-2xl font-extrabold text-ink/30">
                              {line.product.name.charAt(0)}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate font-display font-bold">
                            {line.product.name}
                          </p>
                          <p className="text-xs text-ink-soft">
                            {money(discountedPrice(line.product.price, line.product.discountPercent))} each
                            {line.product.discountPercent > 0 ? <span className="ml-1 font-bold text-tang">(-{line.product.discountPercent}%)</span> : null}
                          </p>
                          <div className="mt-1.5 flex items-center gap-1">
                            <button
                              onClick={() =>
                                onUpdateQty(line.product.id, line.qty - 1)
                              }
                              className="flex h-6 w-6 items-center justify-center rounded-full border border-ink/10 bg-cream transition-colors hover:bg-peach"
                              aria-label="Decrease"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-6 text-center font-display text-sm font-bold tabular-nums">
                              {line.qty}
                            </span>
                            <button
                              onClick={() =>
                                onUpdateQty(line.product.id, line.qty + 1)
                              }
                              disabled={line.qty >= line.product.stock}
                              className="flex h-6 w-6 items-center justify-center rounded-full border border-ink/10 bg-cream transition-colors hover:bg-mint disabled:opacity-30"
                              aria-label="Increase"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span className="font-display font-extrabold tabular-nums">
                            {money(discountedPrice(line.product.price, line.product.discountPercent) * line.qty)}
                          </span>
                          <button
                            onClick={() => onRemove(line.product.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-ink/35 transition-colors hover:bg-berry/10 hover:text-berry"
                            aria-label={`Remove ${line.product.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="space-y-3 border-t border-ink/8 bg-paper px-6 py-5">
                  {discountApplied ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between rounded-2xl bg-mint px-4 py-3"
                    >
                      <span className="flex items-center gap-2 font-display text-sm font-bold text-leaf-deep">
                        <BadgePercent className="h-5 w-5" />
                        10% quiz discount applied
                      </span>
                      <button
                        onClick={onRemoveDiscount}
                        className="text-ink/40 transition-colors hover:text-berry"
                        aria-label="Remove discount"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-1 items-center gap-2 rounded-full border border-ink/10 bg-cream px-4 focus-within:border-leaf">
                          <TicketPercent className="h-4 w-4 text-ink-soft" />
                          <input
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && code.trim()) {
                                onApplyCode(code);
                              }
                            }}
                            placeholder="Promo code"
                            className="w-full bg-transparent py-2.5 text-sm font-semibold outline-none placeholder:text-ink/35"
                          />
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.92 }}
                          onClick={() => code.trim() && onApplyCode(code)}
                          className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-cream transition-colors hover:bg-leaf-deep"
                        >
                          Apply
                        </motion.button>
                      </div>
                      <button
                        onClick={onOpenQuiz}
                        className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-tang transition-colors hover:text-berry"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        No code? Win one — take the best-player quiz
                      </button>
                    </div>
                  )}

                  <div className="space-y-1.5 pt-1 text-sm">
                    <div className="flex justify-between text-ink-soft">
                      <span>Subtotal</span>
                      <span className="font-semibold tabular-nums">
                        {money(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-ink-soft">
                      <span>Quiz discount</span>
                      <span
                        className={`font-semibold tabular-nums ${
                          discount > 0 ? "text-leaf" : ""
                        }`}
                      >
                        {discount > 0 ? `-${money(discount)}` : "—"}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between pt-1.5">
                      <span className="font-display text-lg font-bold">
                        Total
                      </span>
                      <span className="font-display text-2xl font-extrabold tabular-nums">
                        {money(total)}
                      </span>
                    </div>
                  </div>

                  {overBudget ? (
                    <div className="flex items-center gap-2 rounded-2xl bg-berry/10 px-4 py-2.5 text-sm font-medium text-berry">
                      <TriangleAlert className="h-4 w-4 shrink-0" />
                      Over budget by {money(total - balance)} — remove something
                      or grab a discount.
                    </div>
                  ) : null}

                  <motion.button
                    whileHover={overBudget ? undefined : { scale: 1.01 }}
                    whileTap={overBudget ? undefined : { scale: 0.98 }}
                    onClick={onCheckout}
                    disabled={checkingOut || overBudget}
                    className="flex w-full items-center justify-center gap-2 rounded-full py-4 font-display text-lg font-bold text-cream shadow-pill transition-opacity disabled:opacity-50"
                    style={{
                      background:
                        "linear-gradient(135deg, #189A4C 0%, #0B5E2E 100%)",
                    }}
                  >
                    {checkingOut ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Checkout · {money(total)}
                      </>
                    )}
                  </motion.button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
