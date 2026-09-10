"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  AlertTriangle,
  BadgeCheck,
  Boxes,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  PackagePlus,
  RefreshCw,
  ShieldAlert,
  Tag,
  Trash2,
  UserRound,
  Wand2,
  X,
} from "lucide-react";
import type { Product, ToastTone } from "@/lib/types";
import { api } from "@/lib/api";
import { LOW_STOCK_LIMIT, MANAGERS, MANAGER_PASSWORD, isLowStock } from "@/lib/constants";
import { IMAGE_LIBRARY, matchLibraryImage } from "@/lib/imageLibrary";

export default function ManagerModal({
  open,
  onClose,
  onAdded,
  onUpdated,
  onDeleted,
  pushToast,
}: {
  open: boolean;
  onClose: () => void;
  onAdded: (product: Product) => void;
  onUpdated?: (product: Product) => void;
  onDeleted?: (productId: number) => void;
  pushToast: (message: string, tone?: ToastTone) => void;
}) {
  const [step, setStep] = useState<"auth" | "add" | "inventory">("auth");
  const [manager, setManager] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  /** null = let the smart matcher decide from the product name */
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [inventoryProducts, setInventoryProducts] = useState<Product[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [stockDraft, setStockDraft] = useState<Record<number, string>>({});
  const [discountDraft, setDiscountDraft] = useState<Record<number, string>>({});

  const autoMatch = matchLibraryImage(name);

  useEffect(() => {
    if (open) {
      setStep("auth");
      setManager("");
      setPassword("");
      setShowPassword(false);
      setAuthError(null);
      setName("");
      setPrice("");
      setStock("");
      setPhoto(null);
      setBusy(false);
      setInventoryProducts([]);
      setStockDraft({});
      setDiscountDraft({});
    }
  }, [open]);

  const verify = () => {
    const clean = manager.trim();
    const match = MANAGERS.find(
      (m) => m.toLowerCase() === clean.toLowerCase(),
    );
    if (!match || password !== MANAGER_PASSWORD) {
      setAuthError("Only managers can access!");
      return;
    }
    setManager(match);
    setAuthError(null);
    setStep("add");
  };

  const openInventory = async () => {
    const clean = manager.trim();
    const match = MANAGERS.find((m) => m.toLowerCase() === clean.toLowerCase());
    if (!match || password !== MANAGER_PASSWORD) {
      setAuthError("Only managers can access!");
      return;
    }
    setManager(match);
    setAuthError(null);
    setStep("inventory");
    setInventoryLoading(true);
    try {
      const products = await api.listProducts();
      setInventoryProducts(products);
      setStockDraft(Object.fromEntries(products.map((product) => [product.id, String(product.stock)])));
      setDiscountDraft(Object.fromEntries(products.map((product) => [product.id, String(product.discountPercent)])));
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Couldn't load inventory", "error");
    } finally {
      setInventoryLoading(false);
    }
  };

  const saveStock = async (product: Product) => {
    const stock = Number(stockDraft[product.id]);
    if (!Number.isInteger(stock) || stock < 0) {
      pushToast("Stock must be a whole number (0 or more)", "error");
      return;
    }
    setBusy(true);
    try {
      const updated = await api.updateStock({ manager, password, productId: product.id, stock });
      setInventoryProducts((current) => current.map((item) => item.id === updated.id ? updated : item));
      setStockDraft((current) => ({ ...current, [updated.id]: String(updated.stock) }));
      onUpdated?.(updated);
      pushToast(`${updated.name} stock updated to ${updated.stock}`, "success");
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Couldn't update stock", "error");
    } finally {
      setBusy(false);
    }
  };

  const saveDiscount = async (product: Product) => {
    const discountPercent = Number(discountDraft[product.id]);
    if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 90) {
      pushToast("Discount must be between 0% and 90%", "error");
      return;
    }
    setBusy(true);
    try {
      const updated = await api.updateDiscount({ manager, password, productId: product.id, discountPercent });
      setInventoryProducts((current) => current.map((item) => item.id === updated.id ? updated : item));
      setDiscountDraft((current) => ({ ...current, [updated.id]: String(updated.discountPercent) }));
      onUpdated?.(updated);
      pushToast(`${updated.name} discount set to ${updated.discountPercent}%`, "success");
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Couldn't update discount", "error");
    } finally {
      setBusy(false);
    }
  };

  const dropProduct = async (product: Product) => {
    if (!window.confirm(`Drop ${product.name} from the shelf?`)) return;
    setBusy(true);
    try {
      await api.deleteProduct({ manager, password, productId: product.id });
      setInventoryProducts((current) => current.filter((item) => item.id !== product.id));
      onDeleted?.(product.id);
      pushToast(`${product.name} was dropped from the shelf`, "success");
    } catch (error) {
      pushToast(error instanceof Error ? error.message : "Couldn't drop product", "error");
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    const priceValue = Number(price);
    const stockValue = Number(stock);
    if (!name.trim()) {
      pushToast("Give the product a name", "error");
      return;
    }
    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      pushToast("Price must be a positive number", "error");
      return;
    }
    if (!Number.isInteger(stockValue) || stockValue < 0) {
      pushToast("Stock must be a whole number", "error");
      return;
    }
    setBusy(true);
    try {
      const result = await api.addProduct({
        manager,
        password,
        name: name.trim(),
        price: priceValue,
        stock: stockValue,
        image: photo ?? undefined,
      });
      onAdded(result.product);
      if (result.matched === "existing") {
        pushToast(
          `"${result.product.name}" is already on the shelf — reused its photo`,
          "info",
        );
      } else if (result.matched === "library" || result.matched === "manual") {
        pushToast(
          `Photo assigned: ${result.matchedLabel} — shelf updated!`,
          "success",
        );
      } else {
        pushToast(
          `${result.product.name} added to the shelf by ${manager}`,
          "success",
        );
      }
      onClose();
    } catch (error) {
      pushToast(
        error instanceof Error ? error.message : "Couldn't add product",
        "error",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/45 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="relative w-full max-w-md rounded-[2.25rem] border border-ink/8 bg-paper p-7 shadow-card"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 bg-cream transition-colors hover:bg-peach"
              aria-label="Close"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {step === "auth" ? (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-butter">
                  <KeyRound className="h-7 w-7 text-ink" />
                </div>
                <h3 className="mt-4 font-display text-2xl font-extrabold tracking-tight">
                  Staff only
                </h3>
                <p className="mt-1 text-sm text-ink-soft">
                  Warning — you must be a manager to stock the shelves.
                </p>

                <label className="mt-5 block">
                  <span className="mb-1.5 block text-xs font-semibold tracking-wide text-ink-soft uppercase">
                    Manager name
                  </span>
                  <div className="flex items-center gap-2 rounded-2xl border border-ink/10 bg-cream px-4 focus-within:border-leaf focus-within:ring-4 focus-within:ring-leaf/15">
                    <UserRound className="h-5 w-5 text-ink-soft" />
                    <input
                      value={manager}
                      onChange={(e) => setManager(e.target.value)}
                      placeholder="Who goes there?"
                      className="w-full bg-transparent py-3 font-medium outline-none placeholder:text-ink/35"
                    />
                  </div>
                </label>

                <label className="mt-3 block">
                  <span className="mb-1.5 block text-xs font-semibold tracking-wide text-ink-soft uppercase">
                    Passcode
                  </span>
                  <div className="flex items-center gap-2 rounded-2xl border border-ink/10 bg-cream px-4 focus-within:border-leaf focus-within:ring-4 focus-within:ring-leaf/15">
                    <Lock className="h-5 w-5 text-ink-soft" />
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && verify()}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••"
                      className="w-full bg-transparent py-3 font-medium outline-none placeholder:text-ink/35"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="text-ink/40 transition-colors hover:text-ink"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4.5 w-4.5" />
                      ) : (
                        <Eye className="h-4.5 w-4.5" />
                      )}
                    </button>
                  </div>
                </label>

                {authError ? (
                  <p className="mt-3 flex items-center gap-2 rounded-xl bg-berry/10 px-3 py-2 text-sm font-medium text-berry">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    {authError}
                  </p>
                ) : null}

                <p className="mt-3 text-xs text-ink-soft">
                  Managers: {MANAGERS.join(" · ")} — passcode: {MANAGER_PASSWORD}
                </p>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={verify}
                  className="mt-5 w-full rounded-full bg-ink py-3.5 font-display font-bold text-cream transition-colors hover:bg-leaf-deep"
                >
                  Step into the stockroom
                </motion.button>
                <button
                  type="button"
                  onClick={() => void openInventory()}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-ink/10 bg-cream py-3 font-display text-sm font-bold text-ink-soft transition-colors hover:border-leaf hover:bg-mint"
                >
                  <Boxes className="h-4 w-4" />
                  Open inventory control
                </button>
              </>
            ) : step === "inventory" ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-peach">
                      <Boxes className="h-7 w-7 text-tang" />
                    </div>
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-leaf uppercase"><BadgeCheck className="h-4 w-4" /> Hello Mr. {manager}</p>
                      <h3 className="font-display text-2xl font-extrabold tracking-tight">Inventory control</h3>
                    </div>
                  </div>
                  <button type="button" onClick={() => setStep("auth")} className="rounded-full border border-ink/10 bg-cream px-3 py-2 text-xs font-bold text-ink-soft hover:bg-butter">Close</button>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-butter/60 px-4 py-3 text-sm">
                  <span className="flex items-center gap-2 font-semibold text-ink-soft"><AlertTriangle className="h-4 w-4 text-tang" /> Alert at {LOW_STOCK_LIMIT} or less</span>
                  <span className="font-bold text-tang">{inventoryProducts.filter((product) => isLowStock(product.stock)).length} alerts</span>
                </div>
                <div className="mt-4 max-h-[45vh] space-y-2 overflow-y-auto pr-1">
                  {inventoryLoading ? (
                    <div className="flex items-center justify-center gap-2 py-10 text-sm text-ink-soft"><Loader2 className="h-5 w-5 animate-spin" /> Loading stockroom…</div>
                  ) : inventoryProducts.map((product) => {
                    const low = isLowStock(product.stock);
                    return (
                      <div key={product.id} className={`flex items-center gap-3 rounded-2xl border px-3 py-3 ${low ? "border-tang/30 bg-peach/45" : "border-ink/8 bg-cream"}`}>
                        <img src={product.image ?? ""} alt={product.name} className="h-12 w-12 rounded-xl object-cover" />
                        <div className="min-w-0 flex-1"><p className="truncate font-display font-bold">{product.name}</p><p className={`text-xs font-semibold ${low ? "text-tang" : "text-ink-soft"}`}>{low ? "Restock soon" : "Healthy stock"} · {product.stock} available</p></div>
                        <div className="flex items-center gap-1">
                          <input aria-label={`Stock for ${product.name}`} value={stockDraft[product.id] ?? ""} onChange={(event) => setStockDraft((current) => ({ ...current, [product.id]: event.target.value }))} type="number" min={0} step={1} className="w-16 rounded-xl border border-ink/10 bg-paper px-2 py-2 text-center font-bold outline-none focus:border-leaf focus:ring-4 focus:ring-leaf/15" />
                          <button type="button" disabled={busy || stockDraft[product.id] === String(product.stock)} onClick={() => void saveStock(product)} className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-cream transition-colors hover:bg-leaf-deep disabled:opacity-30" aria-label={`Save stock for ${product.name}`}><RefreshCw className="h-3.5 w-3.5" /></button>
                        </div>
                        <div className="flex items-center gap-1">
                          <input aria-label={`Discount for ${product.name}`} value={discountDraft[product.id] ?? ""} onChange={(event) => setDiscountDraft((current) => ({ ...current, [product.id]: event.target.value }))} type="number" min={0} max={90} step={1} className="w-16 rounded-xl border border-tang/20 bg-paper px-2 py-2 text-center font-bold outline-none focus:border-tang focus:ring-4 focus:ring-tang/15" />
                          <button type="button" disabled={busy || discountDraft[product.id] === String(product.discountPercent)} onClick={() => void saveDiscount(product)} className="flex h-8 w-8 items-center justify-center rounded-full bg-tang text-cream transition-colors hover:bg-ink disabled:opacity-30" aria-label={`Save discount for ${product.name}`}><Tag className="h-3.5 w-3.5" /></button>
                        </div>
                        <button type="button" disabled={busy} onClick={() => void dropProduct(product)} className="flex h-8 w-8 items-center justify-center rounded-full border border-berry/20 text-berry transition-colors hover:bg-berry hover:text-cream disabled:opacity-30" aria-label={`Drop ${product.name}`}><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    );
                  })}
                </div>
                <button type="button" onClick={() => setStep("add")} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 font-display font-bold text-cream hover:bg-leaf-deep"><PackagePlus className="h-5 w-5" /> Add new product</button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint">
                    <PackagePlus className="h-7 w-7 text-leaf-deep" />
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-leaf uppercase">
                      <BadgeCheck className="h-4 w-4" />
                      Hello Mr. {manager}
                    </p>
                    <h3 className="font-display text-2xl font-extrabold tracking-tight">
                      Stock a new product
                    </h3>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold tracking-wide text-ink-soft uppercase">
                      Product name
                    </span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Mango Juice"
                      maxLength={32}
                      className="w-full rounded-2xl border border-ink/10 bg-cream px-4 py-3 font-medium outline-none placeholder:text-ink/35 focus:border-leaf focus:ring-4 focus:ring-leaf/15"
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold tracking-wide text-ink-soft uppercase">
                        Price ($)
                      </span>
                      <input
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        type="number"
                        min={0}
                        step="any"
                        placeholder="15"
                        className="w-full rounded-2xl border border-ink/10 bg-cream px-4 py-3 font-medium outline-none placeholder:text-ink/35 focus:border-leaf focus:ring-4 focus:ring-leaf/15"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold tracking-wide text-ink-soft uppercase">
                        Stock count
                      </span>
                      <input
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        type="number"
                        min={0}
                        step={1}
                        placeholder="20"
                        className="w-full rounded-2xl border border-ink/10 bg-cream px-4 py-3 font-medium outline-none placeholder:text-ink/35 focus:border-leaf focus:ring-4 focus:ring-leaf/15"
                      />
                    </label>
                  </div>

                  <div>
                    <span className="mb-1.5 flex items-center justify-between text-xs font-semibold tracking-wide text-ink-soft uppercase">
                      Product photo
                      {photo === null ? (
                        <span className="flex items-center gap-1 font-bold text-leaf normal-case">
                          <Wand2 className="h-3.5 w-3.5" />
                          {autoMatch
                            ? `Auto: ${autoMatch.label}`
                            : "Auto-match by name"}
                        </span>
                      ) : (
                        <span className="font-bold text-tang normal-case">
                          Manual pick
                        </span>
                      )}
                    </span>
                    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
                      <button
                        type="button"
                        onClick={() => setPhoto(null)}
                        className={`flex h-14 shrink-0 items-center gap-2 rounded-2xl border-2 px-3 transition-all ${
                          photo === null
                            ? "border-leaf bg-mint"
                            : "border-ink/10 bg-cream hover:border-ink/25"
                        }`}
                      >
                        {autoMatch ? (
                          <img
                            src={autoMatch.src}
                            alt={autoMatch.label}
                            className="h-10 w-10 rounded-xl object-cover"
                          />
                        ) : (
                          <Wand2 className="h-5 w-5 text-tang" />
                        )}
                        <span className="text-xs font-bold">Auto</span>
                      </button>
                      {IMAGE_LIBRARY.map((entry) => {
                        const selected = photo === entry.src;
                        return (
                          <button
                            key={entry.id}
                            type="button"
                            title={entry.label}
                            onClick={() =>
                              setPhoto(selected ? null : entry.src)
                            }
                            className={`shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${
                              selected
                                ? "border-leaf ring-4 ring-leaf/20"
                                : "border-transparent hover:border-ink/20"
                            }`}
                          >
                            <img
                              src={entry.src}
                              alt={entry.label}
                              className="h-14 w-14 object-cover"
                            />
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-1.5 text-[11px] text-ink-soft">
                      Tip: names like Milk, لبن, Mango Juice, عيش or Eggs get
                      their photo automatically.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex gap-2.5">
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setStep("auth")}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-ink/10 bg-cream transition-colors hover:bg-peach"
                    aria-label="Back"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={submit}
                    disabled={busy}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ink py-3.5 font-display font-bold text-cream transition-colors hover:bg-leaf-deep disabled:opacity-60"
                  >
                    {busy ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <PackagePlus className="h-5 w-5" />
                        Add to shelf
                      </>
                    )}
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
