"use client";

import confetti from "canvas-confetti";

const BRAND_COLORS = ["#189A4C", "#FFC93C", "#FF6B35", "#E64980", "#211D15"];

export function pop() {
  confetti({
    particleCount: 90,
    spread: 70,
    origin: { y: 0.7 },
    colors: BRAND_COLORS,
  });
}

export function celebrate() {
  const defaults = { colors: BRAND_COLORS, zIndex: 120 };
  confetti({ ...defaults, particleCount: 140, spread: 100, origin: { y: 0.6 } });
  window.setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 70,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.8 },
    });
    confetti({
      ...defaults,
      particleCount: 70,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.8 },
    });
  }, 180);
}
