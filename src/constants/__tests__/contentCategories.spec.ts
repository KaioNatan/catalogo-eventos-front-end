import { describe, expect, it } from "vitest";
import {
  labelForEventCategory,
  labelForTouristPointCategory,
} from "../contentCategories";

describe("labelForEventCategory", () => {
  it("mapeia valor canônico para rótulo", () => {
    expect(labelForEventCategory("gastronomia")).toBe("Gastronomia");
    expect(labelForEventCategory("show")).toBe("Show");
  });

  it("retorna vazio para null/undefined/string vazia", () => {
    expect(labelForEventCategory(undefined)).toBe("");
    expect(labelForEventCategory(null)).toBe("");
    expect(labelForEventCategory("")).toBe("");
  });

  it("preserva valor desconhecido", () => {
    expect(labelForEventCategory("legado")).toBe("legado");
  });
});

describe("labelForTouristPointCategory", () => {
  it("mapeia valor canônico para rótulo", () => {
    expect(labelForTouristPointCategory("parque")).toBe("Parque");
    expect(labelForTouristPointCategory("praça")).toBe("Praça");
  });

  it("retorna vazio para ausente", () => {
    expect(labelForTouristPointCategory(undefined)).toBe("");
  });
});
