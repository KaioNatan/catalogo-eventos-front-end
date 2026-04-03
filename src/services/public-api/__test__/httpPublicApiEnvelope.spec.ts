import { describe, expect, it } from "vitest";
import { unwrapCollection, unwrapResource } from "../httpPublicApiEnvelope";

describe("httpPublicApiEnvelope", () => {
  it("unwrapCollection extrai itens e meta de paginação", () => {
    const result = unwrapCollection<{ id: number }>({
      data: [{ id: 1 }],
      links: {},
      meta: { page: 2, limit: 10, total: 25, totalPages: 3 },
    });
    expect(result.items).toEqual([{ id: 1 }]);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(10);
    expect(result.total).toBe(25);
    expect(result.totalPages).toBe(3);
  });

  it("unwrapCollection infere totais quando meta é mínima", () => {
    const result = unwrapCollection({ data: [{ a: 1 }, { a: 2 }] });
    expect(result.items).toHaveLength(2);
    expect(result.page).toBe(1);
    expect(result.total).toBe(2);
    expect(result.totalPages).toBeGreaterThanOrEqual(1);
  });

  it("unwrapResource retorna o payload interno", () => {
    expect(
      unwrapResource<{ x: string }>({ data: { x: "y" }, links: {} }),
    ).toEqual({ x: "y" });
  });

  it("rejeita corpo inválido", () => {
    expect(() => unwrapCollection(null)).toThrow();
    expect(() => unwrapResource({})).toThrow();
  });
});
