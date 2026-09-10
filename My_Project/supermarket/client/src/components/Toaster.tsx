"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import type { Toast } from "@/lib/types";

const ICONS = {
  success: <CheckCircle2 className="h-5 w-5 shrink-0 text-sun" />,
  error: <AlertCircle className="h-5 w-5 shrink-0 text-tang" />,
  info: <Info className="h-5 w-5 shrink-0 text-[#7FB5FF]" />,
};

export default function Toaster({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[130] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: -24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="pointer-events-auto flex max-w-md items-center gap-3 rounded-full border border-white/10 bg-ink px-5 py-3 text-sm font-medium text-cream shadow-pill"
          >
            {ICONS[toast.tone]}
            <span>{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
