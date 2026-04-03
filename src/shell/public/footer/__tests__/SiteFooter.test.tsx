import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SiteFooter } from "../SiteFooter";

vi.mock("@/services/public-api/client", () => ({
  publicApiClient: {
    listActiveSocialLinks: vi.fn(),
  },
}));

import { publicApiClient } from "@/services/public-api/client";

describe("SiteFooter", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(publicApiClient.listActiveSocialLinks).mockResolvedValue([
      {
        id: 1,
        platform: "instagram",
        label: "Instagram",
        url: "https://instagram.com",
        active: true,
        order: 1,
      },
      {
        id: 2,
        platform: "facebook",
        label: "Facebook",
        url: "https://facebook.com",
        active: true,
        order: 2,
      },
      {
        id: 3,
        platform: "youtube",
        label: "YouTube",
        url: "https://youtube.com",
        active: true,
        order: 3,
      },
    ]);
  });

  it("deve renderizar os links de navegação", async () => {
    render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Eventos" })).toHaveAttribute(
        "href",
        "/eventos",
      );
    });

    await waitFor(() => {
      expect(
        screen.getByRole("link", { name: "Pontos turísticos" }),
      ).toHaveAttribute("href", "/pontos-turisticos");
    });
    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Sobre" })).toHaveAttribute(
        "href",
        "/sobre",
      );
    });
  });

  it("deve renderizar os links de mídias sociais", async () => {
    render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>,
    );

    await waitFor(async () => {
      expect(
        await screen.findByRole("link", { name: "Instagram" }),
      ).toHaveAttribute("href", "https://instagram.com");
    });

    await waitFor(async () => {
      expect(
        await screen.findByRole("link", { name: "Facebook" }),
      ).toHaveAttribute("href", "https://facebook.com");
    });
    await waitFor(async () => {
      expect(
        await screen.findByRole("link", { name: "YouTube" }),
      ).toHaveAttribute("href", "https://youtube.com");
    });
  });

  it("deve renderizar mensagem quando não houver mídias sociais", async () => {
    vi.mocked(publicApiClient.listActiveSocialLinks).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText("Nenhuma mídia social disponível."),
    ).toBeInTheDocument();
  });

  it("deve renderizar fallback quando a carga das mídias sociais falhar", async () => {
    vi.mocked(publicApiClient.listActiveSocialLinks).mockRejectedValue(
      new Error("erro"),
    );

    render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText("Nenhuma mídia social disponível."),
    ).toBeInTheDocument();
  });
});
