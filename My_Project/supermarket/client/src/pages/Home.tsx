"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, BadgePercent, Loader2, PackageOpen, Store, Tag } from "lucide-react";
import Background from "@/components/Background";
import Toaster from "@/components/Toaster";
import Welcome from "@/components/Welcome";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";
import QuizModal from "@/components/QuizModal";
import ReceiptModal from "@/components/ReceiptModal";
import ManagerModal from "@/components/ManagerModal";
import { api } from "@/lib/api";
import { celebrate } from "@/lib/confetti";
import { money, round2 } from "@/lib/format";
import { DISCOUNT_CODE, DISCOUNT_RATE, discountedPrice, isLowStock } from "@/lib/constants";
import type {
  CartLine,
  Customer,
  Product,
  Receipt,
  Toast,
  ToastTone,
} from "@/lib/types";

export default function Page() {
  const [screen, setScreen] = useState<"welcome" | "shop">("welcome");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [discountApplied, setDiscountApplied] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const [cartOpen, setCartOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);

  const [loginBusy, setLoginBusy] = useState(false);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = useCallback((message: string, tone: ToastTone = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3400);
  }, []);

  const refreshProducts = useCallback(async () => {
    try {
      setProducts(await api.listProducts());
    } catch {
      pushToast("Couldn't reach the stockroom…", "error");
    } finally {
      setLoadingProducts(false);
    }
  }, [pushToast]);

  useEffect(() => {
    void refreshProducts();
  }, [refreshProducts]);

  /* ---------- auth flow ---------- */

  const handleLogin = useCallback(
    async (name: string, balance: number) => {
      setLoginBusy(true);
      try {
        const loggedIn = await api.login(name, balance);
        setCustomer(loggedIn);
        setCart({});
        setDiscountApplied(false);
        setReceipt(null);
        setScreen("shop");
        pushToast(
          `Welcome ${loggedIn.name}! Login successful — happy shopping.`,
          "success",
        );
      } catch (error) {
        pushToast(
          error instanceof Error ? error.message : "Login failed",
          "error",
        );
      } finally {
        setLoginBusy(false);
      }
    },
    [pushToast],
  );

  const resetForNextCustomer = useCallback(() => {
    setCustomer(null);
    setCart({});
    setDiscountApplied(false);
    setReceipt(null);
    setCartOpen(false);
    setScreen("welcome");
  }, []);

  /* ---------- cart ---------- */

  const cartLines = useMemo<CartLine[]>(
    () =>
      products
        .filter((product) => (cart[product.id] ?? 0) > 0)
        .map((product) => ({ product, qty: cart[product.id] })),
    [cart, products],
  );

  const cartCount = useMemo(
    () => cartLines.reduce((sum, line) => sum + line.qty, 0),
    [cartLines],
  );

  const addToCart = useCallback(
    (product: Product, qty: number) => {
      const inCart = cart[product.id] ?? 0;
      if (inCart + qty > product.stock) {
        pushToast(
          `Sorry, only ${product.stock} of ${product.name} left in stock.`,
          "error",
        );
        return;
      }
      setCart((current) => ({
        ...current,
        [product.id]: (current[product.id] ?? 0) + qty,
      }));
      pushToast(`${qty}× ${product.name} added to your basket`, "success");
    },
    [cart, pushToast],
  );

  const updateQty = useCallback(
    (productId: number, qty: number) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return;
      if (qty <= 0) {
        setCart((current) => {
          const next = { ...current };
          delete next[productId];
          return next;
        });
        return;
      }
      if (qty > product.stock) {
        pushToast(`Only ${product.stock} left in stock.`, "error");
        return;
      }
      setCart((current) => ({ ...current, [productId]: qty }));
    },
    [products, pushToast],
  );

  const removeFromCart = useCallback((productId: number) => {
    setCart((current) => {
      const next = { ...current };
      delete next[productId];
      return next;
    });
  }, []);

  /* ---------- discount quiz ---------- */

  const applyCode = useCallback(
    (code: string) => {
      if (code.trim() === DISCOUNT_CODE) {
        setDiscountApplied(true);
        setQuizOpen(false);
        pushToast("Code accepted — 10% off your whole order!", "success");
      } else {
        pushToast("That code isn't valid… maybe take the quiz?", "error");
      }
    },
    [pushToast],
  );

  /* ---------- checkout ---------- */

  const handleCheckout = useCallback(async () => {
    if (!customer || cartLines.length === 0) return;
    setCheckoutBusy(true);
    try {
      const { receipt: serverReceipt, customer: updatedCustomer } =
        await api.checkout({
          customerId: customer.id,
          items: cartLines.map((line) => ({
            productId: line.product.id,
            qty: line.qty,
          })),
          discountCode: discountApplied ? DISCOUNT_CODE : undefined,
        });

      setReceipt({ ...serverReceipt, customerName: customer.name });
      setCustomer(updatedCustomer);
      setCart({});
      setDiscountApplied(false);
      setCartOpen(false);
      celebrate();
      void refreshProducts();
    } catch (error) {
      pushToast(
        error instanceof Error ? error.message : "Checkout failed",
        "error",
      );
    } finally {
      setCheckoutBusy(false);
    }
  }, [customer, cartLines, discountApplied, pushToast, refreshProducts]);

  /* ---------- manager ---------- */

  const handleProductAdded = useCallback((product: Product) => {
    setProducts((current) => [...current, product]);
  }, []);

  const handleProductUpdated = useCallback((product: Product) => {
    setProducts((current) => current.map((item) => item.id === product.id ? product : item));
  }, []);

  const handleProductDeleted = useCallback((productId: number) => {
    setProducts((current) => current.filter((item) => item.id !== productId));
  }, []);

  /* ---------- derived for hero ---------- */

  const totalStock = useMemo(
    () => products.reduce((sum, p) => sum + p.stock, 0),
    [products],
  );

  const projectedTotal = useMemo(() => {
    const subtotal = cartLines.reduce(
      (sum, line) => sum + discountedPrice(line.product.price, line.product.discountPercent) * line.qty,
      0,
    );
    return round2(
      discountApplied ? subtotal * (1 - DISCOUNT_RATE) : subtotal,
    );
  }, [cartLines, discountApplied]);

  const featuredCategories = useMemo(() => {
    const categories = [
      { label: "Fresh picks", match: /fruit|apple|banana|mango|تفاح|موز|فاكهة/i, color: "bg-mint" },
      { label: "Bakery", match: /bread|toast|خبز|عيش|فينو/i, color: "bg-butter" },
      { label: "Chilled", match: /milk|ice|juice|egg|لبن|ايس|عصير|بيض/i, color: "bg-skybrand/10" },
      { label: "Treats", match: /chip|chocolate|شيبس|شوكو/i, color: "bg-peach" },
    ];
    return categories.map((category) => ({
      ...category,
      count: products.filter((product) => category.match.test(product.name)).length,
    }));
  }, [products]);

  const lowStockProducts = useMemo(
    () => products.filter((product) => product.stock > 0 && isLowStock(product.stock)),
    [products],
  );

  /* ---------- render ---------- */

  return (
    <main className="relative min-h-screen">
      <Background />
      <Toaster toasts={toasts} />

      <AnimatePresence mode="wait">
        {screen === "welcome" || !customer ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
          >
            <Welcome busy={loginBusy} onLogin={handleLogin} />
          </motion.div>
        ) : (
          <motion.div
            key="shop"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Header
              customer={customer}
              cartCount={cartCount}
              onOpenCart={() => setCartOpen(true)}
              onOpenManager={() => setManagerOpen(true)}
              onEndSession={resetForNextCustomer}
            />

            <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.1,
                  duration: 0.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <p className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-leaf uppercase">
                  <Store className="h-4 w-4" />
                  The shelves today
                </p>
                <h2 className="mt-2 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
                  Grab something fresh,{" "}
                  <span className="marker-highlight px-1">
                    {customer.name.split(" ")[0]}.
                  </span>
                </h2>
                <p className="mt-3 max-w-xl text-ink-soft">
                  Everything is priced per piece. Your wallet holds{" "}
                  <strong className="font-semibold text-ink">
                    {money(customer.balance)}
                  </strong>
                  {cartCount > 0 && (
                    <>
                      {" "}
                      and your basket is sitting at{" "}
                      <strong className="font-semibold text-ink">
                        {money(projectedTotal)}
                      </strong>
                    </>
                  )}
                  .
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full border border-ink/10 bg-paper px-4 py-2 text-sm font-semibold text-ink-soft shadow-pop">
                    {products.length} products · {totalStock} pieces
                  </span>
                  <button
                    onClick={() => setQuizOpen(true)}
                    className="flex items-center gap-1.5 rounded-full border border-tang/30 bg-peach px-4 py-2 text-sm font-semibold text-tang shadow-pop transition-colors hover:border-tang"
                  >
                    <BadgePercent className="h-4 w-4" />
                    10% off hides behind a quiz
                  </button>
                </div>
                <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {featuredCategories.map((category) => (
                    <div key={category.label} className={`rounded-2xl border border-ink/5 ${category.color} px-3 py-3 shadow-pop`} style={{backgroundColor: '#d5e2dc'}}>
                      <div className="flex items-center justify-between">
                        <Tag className="h-4 w-4 text-ink/55" />
                        <span className="font-display text-lg font-extrabold">{category.count}</span>
                      </div>
                      <p className="mt-1 text-xs font-bold text-ink-soft">{category.label}</p>
                    </div>
                  ))}
                </div>
                {lowStockProducts.length > 0 ? (
                  <div className="mt-4 flex items-center gap-2 rounded-2xl border border-tang/25 bg-peach/60 px-4 py-3 text-sm font-semibold text-tang">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    Almost gone: {lowStockProducts.map((product) => `${product.name} (${product.stock})`).join(" · ")}
                  </div>
                ) : null}
              </motion.div>

              {loadingProducts ? (
                <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse rounded-[1.75rem] border border-ink/5 bg-paper p-3"
                    >
                      <div className="aspect-[5/4] rounded-[1.35rem] bg-ink/8" />
                      <div className="mt-4 h-5 w-2/3 rounded-full bg-ink/8" />
                      <div className="mt-2 h-4 w-1/3 rounded-full bg-ink/8" />
                      <div className="mt-4 h-10 rounded-full bg-ink/8" />
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="mt-16 flex flex-col items-center gap-3 text-center">
                  <PackageOpen className="h-12 w-12 text-ink/30" />
                  <p className="font-display text-xl font-bold">
                    The shelves are empty
                  </p>
                  <p className="text-sm text-ink-soft">
                    Ask a manager to restock using the key button up top.
                  </p>
                </div>
              ) : (
                <div className="mt-10 grid grid-cols-1 gap-5 pb-32 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      inCart={cart[product.id] ?? 0}
                      index={index}
                      onAdd={addToCart}
                    />
                  ))}
                </div>
              )}
            </section>

            <footer className="border-t border-ink/8 bg-paper/60 py-6 backdrop-blur">
              <p className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-6 text-center text-sm text-ink-soft">
                {loadingProducts ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                FreshMart — where every checkout ends with a smile. Managers on
                duty: Mazen · Adem · Arwa · Dida
              </p>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer
        open={cartOpen}
        lines={cartLines}
        balance={customer?.balance ?? 0}
        discountApplied={discountApplied}
        checkingOut={checkoutBusy}
        onClose={() => setCartOpen(false)}
        onUpdateQty={updateQty}
        onRemove={removeFromCart}
        onApplyCode={applyCode}
        onRemoveDiscount={() => setDiscountApplied(false)}
        onOpenQuiz={() => setQuizOpen(true)}
        onCheckout={handleCheckout}
      />

      <QuizModal
        open={quizOpen}
        onClose={() => setQuizOpen(false)}
        onUnlock={applyCode}
      />

      <ManagerModal
        open={managerOpen}
        onClose={() => setManagerOpen(false)}
        onAdded={handleProductAdded}
        onUpdated={handleProductUpdated}
        onDeleted={handleProductDeleted}
        pushToast={pushToast}
      />

      <ReceiptModal
        receipt={receipt}
        onKeepShopping={() => setReceipt(null)}
        onNextCustomer={resetForNextCustomer}
      />
    </main>
  );
}
