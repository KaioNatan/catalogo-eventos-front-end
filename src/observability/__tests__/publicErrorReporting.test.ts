import { describe, expect, it, vi } from "vitest";
import { reportPublicError } from "../publicErrorReporting";

describe("reportPublicError", () => {
  it("registra no console sem lançar", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    reportPublicError(new Error("x"), { k: 1 });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
