/** Mirrors the original Python supermarket program's rules. */

export const MANAGERS: string[] = ["Mazen", "Adem", "Arwa", "Dida"];

export const MANAGER_PASSWORD = "123ma";

/** The secret quiz reward — just like the original code. */
export const DISCOUNT_CODE = "123";
export const DISCOUNT_RATE = 0.1;
export const LOW_STOCK_LIMIT = 5;

export function isLowStock(stock: number): boolean {
  return Number.isFinite(stock) && stock >= 0 && stock <= LOW_STOCK_LIMIT;
}

export function discountedPrice(price: number, discountPercent: number): number {
  return Math.round(price * (1 - discountPercent / 100) * 100) / 100;
}

/** Pastel tints used for freshly shelved products (and seeded cards). */
export const TINTS: string[] = [
  "#DFF3E4",
  "#FFE0CC",
  "#FCEBB8",
  "#D6E6F8",
  "#FBD3E6",
  "#E4D9F7",
];

/** The (obviously correct) answer to the best-player question. */
export function isQuizAnswer(answer: string): boolean {
  return /ronaldo|cr\s*7|cristiano/i.test(answer.trim());
}

export function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
