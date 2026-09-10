"use client";

import { useCallback, useState, type FormEvent } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  ArrowRight,
  Asterisk,
  KeyRound,
  Loader2,
  ShoppingBasket,
  Sparkles,
  UserRound,
  Wallet,
  Zap,
} from "lucide-react";

const QUICK_BALANCES = [50, 100, 200, 500];

function FloatCard({
  src,
  label,
  price,
  tag,
  rotate,
  depth,
  delay,
  className,
  mx,
  my,
}: {
  src: string;
  label: string;
  price: string;
  tag?: string;
  rotate: number;
  depth: number;
  delay: number;
  className: string;
  mx: MotionValue<number>;
  my: MotionValue<number>;
}) {
  const x = useTransform(mx, (v) => v * depth);
  const y = useTransform(my, (v) => v * depth);
  return (
    <motion.div style={{ x, y }} className={`absolute ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          delay,
          type: "spring",
          stiffness: 160,
          damping: 18,
        }}
      >
        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{
            delay: delay + 0.4,
            duration: 5.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative rounded-[2rem] border-[6px] border-white bg-white shadow-card"
          style={{ rotate }}
        >
          <img
            src={src}
            alt={label}
            className="h-28 w-28 rounded-[1.6rem] object-cover sm:h-36 sm:w-36"
          />
          <span className="absolute -top-3 -right-4 rounded-full bg-sun px-3 py-1 font-display text-sm font-bold text-ink shadow-pop">
            {price}
          </span>
          {tag ? (
            <span className="absolute -bottom-3 left-3 rounded-full bg-ink px-3 py-1 text-[11px] font-semibold tracking-wide text-cream uppercase">
              {tag}
            </span>
          ) : null}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function Welcome({
  busy,
  onLogin,
}: {
  busy: boolean;
  onLogin: (name: string, balance: number) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [balance, setBalance] = useState<string>("100");
  const [error, setError] = useState<string | null>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 60, damping: 20 });
  const smy = useSpring(my, { stiffness: 60, damping: 20 });

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      const { innerWidth, innerHeight } = window;
      mx.set((event.clientX / innerWidth - 0.5) * 2);
      my.set((event.clientY / innerHeight - 0.5) * 2);
    },
    [mx, my],
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    const value = Number(balance);
    if (!trimmed) {
      setError("Tell us your name so we can greet you properly.");
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      setError("Your balance needs to be more than $0 to shop.");
      return;
    }
    setError(null);
    void onLogin(trimmed, value);
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative flex min-h-screen flex-col overflow-hidden"
    >
      <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-4 pt-16 pb-24 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pt-8">
        {/* ---- copy + login ---- */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-paper px-4 py-2 text-xs font-semibold tracking-[0.16em] text-ink-soft uppercase shadow-pop"
          >
            <Sparkles className="h-4 w-4 text-tang" />
            Open 24/7 · Fresh daily
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.08,
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-6 font-display text-5xl leading-[1.02] font-extrabold tracking-tight sm:text-7xl"
          >
            Ahlan! Groceries
            <br />
            that make you{" "}
            <span className="marker-highlight px-1">smile.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.16,
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-5 max-w-md text-lg text-ink-soft"
          >
            Log in, fill your basket and keep an eye on your balance. Psst —
            answer the mystery quiz at checkout for a secret 10% off.
          </motion.p>

          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.24,
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-8 max-w-md rounded-[2rem] border border-ink/8 bg-paper p-5 shadow-card sm:p-6"
          >
            <p className="font-display text-lg font-bold">
              Who&apos;s shopping today?
            </p>

            <label className="mt-4 block">
              <span className="mb-1.5 block text-xs font-semibold tracking-wide text-ink-soft uppercase">
                Your name
              </span>
              <div className="flex items-center gap-2 rounded-2xl border border-ink/10 bg-cream px-4 transition-shadow focus-within:border-leaf focus-within:ring-4 focus-within:ring-leaf/15">
                <UserRound className="h-5 w-5 text-ink-soft" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mazen"
                  className="w-full bg-transparent py-3.5 text-base font-medium outline-none placeholder:text-ink/35"
                  maxLength={24}
                />
              </div>
            </label>

            <label className="mt-3 block">
              <span className="mb-1.5 block text-xs font-semibold tracking-wide text-ink-soft uppercase">
                Starting balance
              </span>
              <div className="flex items-center gap-2 rounded-2xl border border-ink/10 bg-cream px-4 transition-shadow focus-within:border-leaf focus-within:ring-4 focus-within:ring-leaf/15">
                <Wallet className="h-5 w-5 text-ink-soft" />
                <span className="font-display font-bold text-ink-soft">$</span>
                <input
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  type="number"
                  min={1}
                  step="any"
                  placeholder="100"
                  className="w-full bg-transparent py-3.5 text-base font-medium outline-none placeholder:text-ink/35"
                />
              </div>
            </label>

            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK_BALANCES.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setBalance(String(value))}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-all ${
                    Number(balance) === value
                      ? "border-ink bg-ink text-cream"
                      : "border-ink/15 bg-cream text-ink-soft hover:border-ink/40"
                  }`}
                >
                  ${value}
                </button>
              ))}
            </div>

            {error ? (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 rounded-xl bg-berry/10 px-3 py-2 text-sm font-medium text-berry"
              >
                {error}
              </motion.p>
            ) : null}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={busy}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-4 font-display text-lg font-bold text-cream shadow-pill transition-colors hover:bg-leaf-deep disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Enter the market
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </motion.button>

            <button
              type="button"
              disabled={busy}
              onClick={() => void onLogin("Guest", 100)}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border-2 border-ink/10 bg-cream py-3.5 font-display text-sm font-bold text-ink transition-colors hover:border-leaf hover:bg-mint disabled:opacity-60"
            >
              Continue as guest
              <ArrowRight className="h-4 w-4" />
            </button>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-ink-soft">
              <Zap className="h-3.5 w-3.5 text-sun" />
              No account needed — enter with a name or continue as guest.
            </p>
          </motion.form>
        </div>

        {/* ---- floating produce cluster ---- */}
        <div className="relative hidden h-[560px] select-none lg:block">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="absolute top-1/2 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-mint"
          />
          <div className="absolute top-1/2 left-1/2 h-[33rem] w-[33rem] -translate-x-1/2 -translate-y-1/2">
            <svg
              viewBox="0 0 100 100"
              className="h-full w-full animate-spin-slower opacity-40"
            >
              <circle
                cx="50"
                cy="50"
                r="48"
                fill="none"
                stroke="var(--color-ink)"
                strokeWidth="0.6"
                strokeDasharray="2 3"
              />
            </svg>
          </div>

          <FloatCard
            src="/manus-storage/milk_4cb36e28.jpg"
            label="Milk"
            price="$20"
            tag="Farm fresh"
            rotate={-5}
            depth={26}
            delay={0.35}
            className="top-6 left-6"
            mx={smx}
            my={smy}
          />
          <FloatCard
            src="/manus-storage/chips_47eafbae.jpg"
            label="Chips"
            price="$10"
            tag="Crunchy"
            rotate={6}
            depth={-38}
            delay={0.5}
            className="top-16 right-2"
            mx={smx}
            my={smy}
          />
          <FloatCard
            src="/manus-storage/icecream_025b36c7.jpg"
            label="Ice Cream"
            price="$5"
            tag="Best seller"
            rotate={-3}
            depth={-22}
            delay={0.65}
            className="bottom-10 left-20"
            mx={smx}
            my={smy}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.85, type: "spring", stiffness: 200 }}
            className="absolute right-14 bottom-24 flex items-center gap-2 rounded-full bg-berry px-4 py-2.5 text-sm font-bold text-cream shadow-pop"
            style={{ rotate: 6 }}
          >
            <KeyRound className="h-4 w-4" />
            Quiz = 10% off
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, type: "spring", stiffness: 200 }}
            className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-3 rounded-[1.6rem] border border-ink/8 bg-paper px-5 py-4 shadow-card"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-leaf text-cream">
              <ShoppingBasket className="h-6 w-6" />
            </span>
            <div>
              <p className="font-display text-xl leading-none font-extrabold">
                FreshMart
              </p>
              <p className="mt-1 text-xs font-medium tracking-wide text-ink-soft uppercase">
                The playful supermarket
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ---- marquee ---- */}
      <div className="relative z-10 -rotate-1 border-y-2 border-ink bg-sun py-3">
        <div className="flex w-max animate-marquee items-center gap-6">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center gap-6">
              {[
                "Fresh market",
                "Daily deals",
                "10% quiz inside",
                "Open 24/7",
                "Taste the color",
              ].map((word) => (
                <span
                  key={`${copy}-${word}`}
                  className="flex items-center gap-6 font-display text-xl font-extrabold tracking-tight whitespace-nowrap uppercase"
                >
                  {word}
                  <Asterisk className="h-6 w-6" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
