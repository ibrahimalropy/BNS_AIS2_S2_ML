export function money(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return `$${Number.isInteger(rounded) ? rounded : rounded.toFixed(2)}`;
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
