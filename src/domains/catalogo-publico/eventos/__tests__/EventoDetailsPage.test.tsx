import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EventoDetailsPage } from "../pages/EventoDetailsPage";

vi.mock("@/services/public-api/client", () => ({
  publicApiClient: {
    getPublishedEventById: vi.fn(),
  },
}));

import { publicApiClient } from "@/services/public-api/client";

function renderWithRoute(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/eventos/:id" element={<EventoDetailsPage />} />
        <Route path="/eventos" element={<div>Eventos fallback</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("EventoDetailsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar loading inicial", () => {
    vi.mocked(publicApiClient.getPublishedEventById).mockImplementation(
      () => new Promise(() => undefined),
    );

    renderWithRoute("/eventos/1");

    expect(
      screen.getByRole("status", { name: /carregando dados do evento/i }),
    ).toBeInTheDocument();
  });

  it("deve renderizar os dados do evento quando encontrado", async () => {
    vi.mocked(publicApiClient.getPublishedEventById).mockResolvedValue({
      id: 1,
      cityId: 1,
      citySlug: "dourados",
      name: "Festival Gastronômico de Dourados",
      description: "Sabores regionais, música e experiências culturais.",
      category: "gastronomia",
      startDate: "2026-03-20",
      endDate: "2026-03-22",
      formattedDate: "20 a 22 de março de 2026",
      location: "Parque dos Ipês",
      imageUrl: "/images/highlights/festival-gastronomico.jpg",
      featured: true,
      published: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    renderWithRoute("/eventos/1");

    expect(
      await screen.findByText("Festival Gastronômico de Dourados"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Sabores regionais, música e experiências culturais."),
    ).toBeInTheDocument();

    expect(screen.getAllByText("Gastronomia").length).toBeGreaterThan(0);
    expect(screen.getByText("20 a 22 de março de 2026")).toBeInTheDocument();
    expect(screen.getAllByText("Parque dos Ipês").length).toBeGreaterThan(0);
  });

  it("deve redirecionar para /eventos quando o evento não existir", async () => {
    vi.mocked(publicApiClient.getPublishedEventById).mockResolvedValue(null);

    renderWithRoute("/eventos/999999");

    await waitFor(() => {
      expect(screen.getByText("Eventos fallback")).toBeInTheDocument();
    });
  });

  it("deve exibir estado de erro quando a API falhar", async () => {
    vi.mocked(publicApiClient.getPublishedEventById).mockRejectedValue(
      new Error("falha de rede"),
    );

    renderWithRoute("/eventos/1");

    expect(
      await screen.findByText("Erro ao carregar o evento"),
    ).toBeInTheDocument();
    expect(screen.getByText("falha de rede")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Voltar para eventos" }),
    ).toHaveAttribute("href", "/eventos");
  });
});
