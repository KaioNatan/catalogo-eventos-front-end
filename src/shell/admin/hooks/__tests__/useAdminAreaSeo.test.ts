import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useAdminAreaSeo } from "../useAdminAreaSeo";

describe("useAdminAreaSeo", () => {
  afterEach(() => {
    document.head
      .querySelectorAll('meta[name="robots"]')
      .forEach((node: Element) => {
        node.remove();
      });
  });

  it("deve inserir meta robots no head e remover ao desmontar", () => {
    const { unmount } = renderHook(() => useAdminAreaSeo());

    const meta: HTMLMetaElement | null = document.querySelector(
      'meta[name="robots"]',
    );
    expect(meta).not.toBeNull();
    expect(meta?.getAttribute("content")).toBe("noindex, nofollow");

    unmount();

    const after: HTMLMetaElement | null = document.querySelector(
      'meta[name="robots"]',
    );
    expect(after).toBeNull();
  });
});
