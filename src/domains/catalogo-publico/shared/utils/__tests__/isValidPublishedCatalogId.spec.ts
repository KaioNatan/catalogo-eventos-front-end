import { isValidPublishedCatalogId } from "../isValidPublishedCatalogId";
import { describe, expect, it } from "vitest";

describe("isValidPublishedCatalogId", () => {
  it("aceita inteiros positivos finitos", () => {
    expect(isValidPublishedCatalogId(1)).toBe(true);
    expect(isValidPublishedCatalogId(42)).toBe(true);
  });

  it("rejeita undefined, zero, negativos e não finitos", () => {
    expect(isValidPublishedCatalogId(undefined)).toBe(false);
    expect(isValidPublishedCatalogId(0)).toBe(false);
    expect(isValidPublishedCatalogId(-1)).toBe(false);
    expect(isValidPublishedCatalogId(Number.NaN)).toBe(false);
    expect(isValidPublishedCatalogId(Number.POSITIVE_INFINITY)).toBe(false);
  });
});
