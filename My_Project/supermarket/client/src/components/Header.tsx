"use client";

import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";
import {
  CalendarDays,
  Info,
  KeyRound,
  LogOut,
  Phone,
  ShoppingBasket,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import type { Customer } from "@/lib/types";
import { money } from "@/lib/format";

function AnimatedBalance({ value }: { value: number }) {
  const spring = useSpring(value, { stiffness: 140, damping: 22 });
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(
    () =>
      spring.on("change", (latest) => {
        setDisplay(latest);
      }),
    [spring],
  );

  return <span className="tabular-nums">{money(display)}</span>;
}

export default function Header({
  customer,
  cartCount,
  onOpenCart,
  onOpenManager,
  onEndSession,
}: {
  customer: Customer;
  cartCount: number;
  onOpenCart: () => void;
  onOpenManager: () => void;
  onEndSession: () => void;
}) {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <header className="sticky top-3 z-40 mx-auto w-full max-w-6xl px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 24 }}
        className="flex items-center justify-between gap-3 rounded-full border border-ink/8 bg-paper/85 py-2.5 pr-2.5 pl-4 shadow-pop backdrop-blur-xl"
      >
        <div className="relative flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-leaf text-cream">
            <ShoppingBasket className="h-5 w-5" />
          </span>
          <button
            type="button"
            onClick={() => setInfoOpen((open) => !open)}
            aria-expanded={infoOpen}
            aria-label="Show FreshMart information"
            className="flex items-center gap-1.5 rounded-xl px-1.5 py-1 text-left transition-colors hover:bg-mint"
          >
            <span className="font-display text-lg leading-none font-extrabold tracking-tight">
              FreshMart
            </span>
            <Info className="h-4 w-4 text-leaf" />
          </button>
          <span className="hidden rounded-full bg-mint px-3 py-1 text-xs font-semibold text-leaf-deep sm:block">
            Hi, {customer.name.split(" ")[0]}
          </span>
          {infoOpen ? (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute top-14 left-0 z-50 w-72 rounded-2xl border border-ink/10 bg-paper p-4 text-left shadow-card"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-base font-extrabold">FreshMart</p>
                  <p className="mt-1 text-xs text-ink-soft">The playful neighborhood supermarket</p>
                </div>
                <span className="rounded-full bg-mint px-2.5 py-1 text-[10px] font-bold text-leaf-deep">OPEN 24/7</span>
              </div>
              <div className="mt-4 space-y-2.5 text-sm text-ink-soft">
                <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-leaf" /> Serving the neighborhood since 2026</p>
                <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-tang" /> Delivery: <a className="font-bold text-ink underline decoration-tang/40" href="tel:+201012345678">010 1234 5678</a></p>
                <p className="border-t border-ink/8 pt-2.5 text-xs leading-relaxed">Managers on duty: Mazen · Adem · Arwa · Dida</p>
              </div>
            </motion.div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-ink/10 bg-cream px-4 py-2">
            <Wallet className="h-4 w-4 text-leaf" />
            <span className="font-display text-base font-bold">
              <AnimatedBalance value={customer.balance} />
            </span>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onOpenManager}
            title="Manager access"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 bg-cream text-ink-soft transition-colors hover:bg-butter"
          >
            <KeyRound className="h-4.5 w-4.5" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onEndSession}
            title="End session"
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-ink/10 bg-cream text-ink-soft transition-colors hover:bg-berry/15 hover:text-berry sm:flex"
          >
            <LogOut className="h-4.5 w-4.5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={onOpenCart}
            className="relative flex h-11 items-center gap-2 rounded-full bg-ink px-4 text-cream shadow-pill transition-colors hover:bg-leaf-deep"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="hidden font-display text-sm font-bold sm:block">
              Basket
            </span>
            <motion.span
              key={cartCount}
              initial={{ scale: 0.3 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 16 }}
              className="flex h-6 min-w-6 items-center justify-center rounded-full bg-tang px-1.5 font-display text-xs font-extrabold text-cream"
            >
              {cartCount}
            </motion.span>
          </motion.button>
        </div>
      </motion.div>
    </header>
  );
}
