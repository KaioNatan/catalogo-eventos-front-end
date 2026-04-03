import { describe, expect, it } from "vitest";
import {
  finalizeHHmmString,
  maskHHmmInput,
  openingHoursFromApiToForm,
  openingHoursToApi,
} from "../hhmmInput";

describe("maskHHmmInput", () => {
  it("filtra não-dígitos e limita a 4 dígitos", () => {
    expect(maskHHmmInput("ab12cd34ef")).toBe("12:34");
  });

  it("não insere dois pontos antes da hora completa", () => {
    expect(maskHHmmInput("9")).toBe("9");
    expect(maskHHmmInput("09")).toBe("09");
  });

  it("insere dois pontos após dois dígitos da hora", () => {
    expect(maskHHmmInput("0930")).toBe("09:30");
    expect(maskHHmmInput("123")).toBe("12:3");
  });
});

describe("finalizeHHmmString", () => {
  it("completa minutos com zero quando só a hora foi informada", () => {
    expect(finalizeHHmmString("9")).toBe("09:00");
    expect(finalizeHHmmString("09")).toBe("09:00");
  });

  it("interpreta HH:mm com minuto de um dígito como unidade (ex.: 12:3 → 12:03)", () => {
    expect(finalizeHHmmString("12:3")).toBe("12:03");
  });

  it("limita hora e minuto", () => {
    expect(finalizeHHmmString("25:99")).toBe("23:59");
  });

  it("interpreta quatro dígitos sem dois pontos como HHMM", () => {
    expect(finalizeHHmmString("1430")).toBe("14:30");
  });
});

describe("openingHoursToApi / openingHoursFromApiToForm", () => {
  it("retorna undefined para vazio", () => {
    expect(openingHoursToApi("")).toBeUndefined();
    expect(openingHoursToApi("  ")).toBeUndefined();
  });

  it("aceita só valores HH:mm válidos ao hidratar o form", () => {
    expect(openingHoursFromApiToForm("08:00")).toBe("08:00");
    expect(openingHoursFromApiToForm("24:00")).toBe("");
    expect(openingHoursFromApiToForm("Todos os dias")).toBe("");
  });
});
