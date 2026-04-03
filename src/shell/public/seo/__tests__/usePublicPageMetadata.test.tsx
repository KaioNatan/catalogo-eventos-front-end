import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { mockBaseUrl } = vi.hoisted(() => ({
  mockBaseUrl: vi.fn(() => ""),
}));

vi.mock("../siteBaseUrl", () => ({
  getPublicSiteBaseUrl: () => mockBaseUrl(),
}));

import { usePublicPageMetadata } from "../usePublicPageMetadata";

function SeoConsumer(props: {
  title: string;
  description?: string;
  canonicalPath?: string;
  noIndex?: boolean;
}): null {
  usePublicPageMetadata(props);
  return null;
}

describe("usePublicPageMetadata", () => {
  afterEach(() => {
    document.title = "";
    document.querySelector('meta[name="description"]')?.remove();
    document.querySelector('link[rel="canonical"]')?.remove();
    document.querySelector('meta[name="robots"]')?.remove();
    mockBaseUrl.mockReturnValue("");
  });

  it("define título e meta description", async () => {
    render(
      <SeoConsumer
        title="Página teste"
        description="Descrição única para teste."
      />,
    );

    await waitFor(() => {
      expect(document.title).toBe("Página teste");
    });
    expect(
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content"),
    ).toBe("Descrição única para teste.");
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
  });

  it("define canonical quando há site base", async () => {
    mockBaseUrl.mockReturnValue("https://portal.exemplo.com");

    render(<SeoConsumer title="X" canonicalPath="/eventos" />);

    await waitFor(() => {
      expect(
        document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
      ).toBe("https://portal.exemplo.com/eventos");
    });
  });

  it("define meta robots noindex quando noIndex é true", async () => {
    render(<SeoConsumer title="404" noIndex />);

    await waitFor(() => {
      expect(
        document.querySelector('meta[name="robots"]')?.getAttribute("content"),
      ).toBe("noindex, nofollow");
    });
  });
});
