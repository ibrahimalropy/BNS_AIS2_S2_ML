import { describe, expect, it } from "vitest";
import { DISCOUNT_CODE, DISCOUNT_RATE, LOW_STOCK_LIMIT, discountedPrice, isLowStock, isQuizAnswer, titleCase } from "../client/src/lib/constants";
import { matchLibraryImage } from "../client/src/lib/imageLibrary";

describe("FreshMart business rules", () => {
  it("recognizes the discount quiz answer and keeps the configured reward", () => {
    expect(isQuizAnswer("Cristiano Ronaldo")).toBe(true);
    expect(isQuizAnswer("Messi")).toBe(false);
    expect(DISCOUNT_CODE).toBe("123");
    expect(DISCOUNT_RATE).toBe(0.1);
  });

  it("normalizes customer and product names", () => {
    expect(titleCase("  mango   juice ")).toBe("Mango Juice");
  });

  it("matches product photos in English and Arabic", () => {
    expect(matchLibraryImage("Mango Juice")?.id).toBe("juice");
    expect(matchLibraryImage("عيش بلدي")?.id).toBe("bread");
    expect(matchLibraryImage("unknown item")).toBeNull();
  });

  it("flags low stock at five units or less", () => {
    expect(LOW_STOCK_LIMIT).toBe(5);
    expect(isLowStock(5)).toBe(true);
    expect(isLowStock(6)).toBe(false);
  });

  it("calculates a manager product discount", () => {
    expect(discountedPrice(100, 15)).toBe(85);
    expect(discountedPrice(19.99, 10)).toBe(17.99);
  });
});
