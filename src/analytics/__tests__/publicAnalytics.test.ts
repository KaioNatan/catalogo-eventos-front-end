import { afterEach, describe, expect, it, vi } from "vitest";

import { trackPublicEvent } from "../publicAnalytics";

describe("trackPublicEvent", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete (window as unknown as { dataLayer?: unknown[] }).dataLayer;
  });

  it("empurra evento para dataLayer quando existe", () => {
    window.dataLayer = [];
    trackPublicEvent("public_test", { page: "/x" });

    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({ event: "public_test", page: "/x" }),
    );
  });

  it("inicializa dataLayer se ausente", () => {
    delete (window as unknown as { dataLayer?: unknown[] }).dataLayer;
    trackPublicEvent("evt");

    expect(Array.isArray(window.dataLayer)).toBe(true);
    expect(window.dataLayer).toContainEqual(
      expect.objectContaining({ event: "evt" }),
    );
  });
});
