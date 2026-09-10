"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HelpCircle, PartyPopper, Trophy, X } from "lucide-react";
import { isQuizAnswer, DISCOUNT_CODE } from "@/lib/constants";
import { pop } from "@/lib/confetti";

export default function QuizModal({
  open,
  onClose,
  onUnlock,
}: {
  open: boolean;
  onClose: () => void;
  onUnlock: (code: string) => void;
}) {
  const [answer, setAnswer] = useState("");
  const [won, setWon] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (open) {
      setAnswer("");
      setWon(false);
      setAttempts(0);
    }
  }, [open]);

  const submit = () => {
    if (!answer.trim()) return;
    if (isQuizAnswer(answer)) {
      setWon(true);
      pop();
    } else {
      setAttempts((a) => a + 1);
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
              aria-label="Close quiz"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {!won ? (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sun">
                  <HelpCircle className="h-7 w-7 text-ink" />
                </div>
                <h3 className="mt-4 font-display text-2xl font-extrabold tracking-tight">
                  Win 10% off
                </h3>
                <p className="mt-1 text-sm text-ink-soft">
                  One question stands between you and a discount. Football fans
                  will find this easy.
                </p>

                <motion.div
                  key={attempts}
                  animate={
                    attempts > 0 ? { x: [0, -10, 10, -6, 6, 0] } : undefined
                  }
                  transition={{ duration: 0.4 }}
                  className="mt-5"
                >
                  <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
                    The question
                  </p>
                  <p className="mt-1 font-display text-xl font-bold">
                    Who is the best player in the whole world?
                  </p>
                  <input
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submit()}
                    placeholder="Type the legend's name…"
                    autoFocus
                    className="mt-3 w-full rounded-2xl border border-ink/10 bg-cream px-4 py-3.5 font-medium outline-none placeholder:text-ink/35 focus:border-leaf focus:ring-4 focus:ring-leaf/15"
                  />
                </motion.div>

                {attempts > 0 ? (
                  <p className="mt-2.5 text-sm font-medium text-berry">
                    Hmm, the crowd disagrees. Hint: he says
                    &quot;Siuuuu!&quot; and wears number 7.
                  </p>
                ) : null}

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={submit}
                  className="mt-5 w-full rounded-full bg-ink py-3.5 font-display font-bold text-cream transition-colors hover:bg-leaf-deep"
                >
                  Lock in my answer
                </motion.button>
              </>
            ) : (
              <div className="flex flex-col items-center py-4 text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 240, damping: 14 }}
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-leaf text-cream"
                >
                  <Trophy className="h-10 w-10" />
                </motion.div>
                <h3 className="mt-5 font-display text-3xl font-extrabold tracking-tight">
                  SIUUU! Correct.
                </h3>
                <p className="mt-2 max-w-xs text-sm text-ink-soft">
                  The GOAT has spoken. Here is your 10% discount code — guard it
                  with your life.
                </p>
                <div className="mt-5 rounded-2xl border-2 border-dashed border-leaf/50 bg-mint px-8 py-4">
                  <p className="text-[10px] font-bold tracking-[0.3em] text-leaf-deep uppercase">
                    Secret code
                  </p>
                  <p className="font-display text-4xl font-extrabold tracking-[0.2em] text-leaf-deep">
                    {DISCOUNT_CODE}
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onUnlock(DISCOUNT_CODE)}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 font-display font-bold text-cream transition-colors hover:bg-leaf-deep"
                >
                  <PartyPopper className="h-5 w-5" />
                  Apply it to my order
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
