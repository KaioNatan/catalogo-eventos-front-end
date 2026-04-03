import { describe, expect, it } from "vitest";
import {
  isAdminMockLoginAllowed,
  mustClearAdminSessionWithoutApiInProduction,
} from "../adminAuthDevPolicy";

describe("adminAuthDevPolicy", () => {
  it("mock nunca é permitido quando há URL da API", () => {
    expect(isAdminMockLoginAllowed(false)).toBe(false);
  });

  it("sem URL, mock depende de import.meta.env.DEV (true em Vitest)", () => {
    expect(isAdminMockLoginAllowed(true)).toBe(import.meta.env.DEV === true);
  });

  it("com URL da API, nunca força limpeza por falta de config", () => {
    expect(mustClearAdminSessionWithoutApiInProduction(false)).toBe(false);
  });
});
