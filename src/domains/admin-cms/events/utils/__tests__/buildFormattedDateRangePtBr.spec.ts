import { describe, expect, it } from "vitest";
import { buildFormattedDateRangePtBr } from "../buildFormattedDateRangePtBr";

describe("buildFormattedDateRangePtBr", () => {
  it("formata intervalo no mesmo mês como no placeholder (20 a 22 de março de 2026)", () => {
    expect(buildFormattedDateRangePtBr("2026-03-20", "2026-03-22")).toBe(
      "20 a 22 de março de 2026",
    );
  });

  it("formata um único dia", () => {
    expect(buildFormattedDateRangePtBr("2026-03-20", "2026-03-20")).toBe(
      "20 de março de 2026",
    );
  });

  it("formata meses diferentes no mesmo ano", () => {
    expect(buildFormattedDateRangePtBr("2026-03-20", "2026-04-22")).toBe(
      "20 de março a 22 de abril de 2026",
    );
  });

  it("formata anos diferentes", () => {
    expect(buildFormattedDateRangePtBr("2026-12-20", "2027-01-05")).toBe(
      "20 de dezembro de 2026 a 5 de janeiro de 2027",
    );
  });

  it("retorna vazio quando fim é antes do início", () => {
    expect(buildFormattedDateRangePtBr("2026-03-22", "2026-03-20")).toBe("");
  });

  it("retorna vazio quando alguma data está ausente", () => {
    expect(buildFormattedDateRangePtBr("", "2026-03-20")).toBe("");
    expect(buildFormattedDateRangePtBr("2026-03-20", "")).toBe("");
  });
});
