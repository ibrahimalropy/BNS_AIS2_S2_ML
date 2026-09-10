"use client";

import { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, ReceiptText, Store, UserRoundPlus, X } from "lucide-react";
import type { Receipt } from "@/lib/types";
import { money } from "@/lib/format";

function Barcode({ seed }: { seed: number }) {
  const bars = useMemo(() => {
    let state = Math.max(1, Math.floor(seed) % 2147483646);
    const widths: number[] = [];
    for (let i = 0; i < 34; i += 1) {
      state = (state * 48271) % 2147483647;
      widths.push(1 + (state % 4));
    }
    return widths;
  }, [seed]);

  return (
    <div className="flex h-12 items-stretch justify-center gap-[2px]">
      {bars.map((width, i) => (
        <span
          key={i}
          className="bg-ink"
          style={{ width: `${width}px` }}
        />
      ))}
    </div>
  );
}

export default function ReceiptModal({
  receipt,
  onKeepShopping,
  onNextCustomer,
}: {
  receipt: Receipt | null;
  onKeepShopping: () => void;
  onNextCustomer: () => void;
}) {
  const open = receipt !== null;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const placedAt = receipt ? new Date(receipt.placedAt) : null;

  return (
    <AnimatePresence>
      {receipt ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto px-4 py-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onKeepShopping}
            className="fixed inset-0 bg-ink/55 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 80, rotate: -2, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 220, damping: 24 }}
            className="relative w-full max-w-sm"
          >
            <div className="bg-paper px-7 pt-8 pb-6 [border-radius:2rem_2rem_0_0] shadow-card">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-leaf text-cream">
                  <Store className="h-6 w-6" />
                </div>
                <p className="mt-3 font-display text-2xl font-extrabold tracking-tight">
                  FreshMart
                </p>
                <p className="text-[10px] font-bold tracking-[0.3em] text-ink-soft uppercase">
                  Official receipt
                </p>
                <p className="mt-1 text-xs text-ink-soft">
                  {placedAt?.toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  ·{" "}
                  {placedAt?.toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div className="my-4 border-t-2 border-dashed border-ink/15" />

              <div className="space-y-2 font-[500]">
                {receipt.lines.map((line) => (
                  <div
                    key={line.name}
                    className="flex items-baseline gap-2 text-sm"
                  >
                    <span className="font-semibold">
                      {line.qty}× {line.name}
                    </span>
                    <span className="flex-1 border-b border-dotted border-ink/20" />
                    <span className="tabular-nums">
                      {money(line.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="my-4 border-t-2 border-dashed border-ink/15" />

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-ink-soft">
                  <span>Subtotal</span>
                  <span className="tabular-nums">
                    {money(receipt.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-ink-soft">
                  <span>Quiz discount</span>
                  <span className="tabular-nums text-leaf">
                    {receipt.discount > 0
                      ? `-${money(receipt.discount)}`
                      : "$0"}
                  </span>
                </div>
                <div className="flex items-baseline justify-between pt-2">
                  <span className="font-display text-lg font-extrabold">
                    TOTAL
                  </span>
                  <span className="font-display text-3xl font-extrabold tabular-nums">
                    {money(receipt.total)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-ink-soft">
                  <span>Balance left</span>
                  <span className="font-semibold tabular-nums">
                    {money(receipt.remainingBalance)}
                  </span>
                </div>
              </div>

              <div className="mt-5">
                <Barcode seed={Math.round(receipt.total * 7 + 13)} />
                <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-xs text-ink-soft">
                  Thank you {receipt.customerName} for doing business with us!
                  <Heart className="h-3.5 w-3.5 fill-berry text-berry" />
                </p>
              </div>
            </div>
            <div className="receipt-edge w-full" />

            <div className="mt-6 flex gap-3">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={onNextCustomer}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-cream py-3.5 font-display font-bold text-ink shadow-pill transition-colors hover:bg-white"
              >
                <UserRoundPlus className="h-5 w-5" />
                Next customer
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={onKeepShopping}
                className="flex items-center justify-center gap-2 rounded-full border border-cream/30 px-5 py-3.5 text-sm font-bold text-cream transition-colors hover:bg-cream/10"
              >
                <ReceiptText className="h-4.5 w-4.5" />
                Keep shopping
              </motion.button>
            </div>

            <button
              onClick={onKeepShopping}
              className="absolute -top-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full bg-ink text-cream shadow-pop transition-colors hover:bg-berry"
              aria-label="Close receipt"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
