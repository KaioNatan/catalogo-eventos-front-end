import { describe, expect, it } from "vitest";
import { isRequestAborted } from "../isRequestAborted";

describe("isRequestAborted", () => {
  it("detecta AbortError do DOM", () => {
    expect(isRequestAborted(new DOMException("aborted", "AbortError"))).toBe(
      true,
    );
  });

  it("detecta cancelamento do Axios", () => {
    expect(isRequestAborted({ code: "ERR_CANCELED" })).toBe(true);
  });

  it("retorna false para erro genérico", () => {
    expect(isRequestAborted(new Error("fail"))).toBe(false);
  });
});
