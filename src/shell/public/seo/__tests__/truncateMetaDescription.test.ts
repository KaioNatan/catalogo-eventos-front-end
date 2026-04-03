import { describe, expect, it } from "vitest";
import { truncateMetaDescription } from "../truncateMetaDescription";

describe("truncateMetaDescription", () => {
  it("normaliza espaços e respeita limite", () => {
    expect(truncateMetaDescription("a  b", 5)).toBe("a b");
    const long = "x".repeat(200);
    expect(truncateMetaDescription(long, 20).length).toBeLessThanOrEqual(21);
    expect(truncateMetaDescription(long, 20).endsWith("…")).toBe(true);
  });
});
