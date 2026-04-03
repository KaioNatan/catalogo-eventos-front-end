import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CityDetailsPage } from "../pages/CityDetailsPage";

vi.mock("@/services/public-api/client", () => ({
  publicApiClient: {
    getPublishedCityBySlug: vi.fn(),
  },
}));

import { publicApiClient } from "@/services/public-api/client";

function renderWithRoute(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/cidades" element={<div>Cidades índice</div>} />
        <Route path="/cidades/:slug" element={<CityDetailsPage />} />
        <Route path="/" element={<div>Home fallback</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("CityDetailsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar os dados da cidade quando o slug for válido", async () => {
    vi.mocked(publicApiClient.getPublishedCityBySlug).mockResolvedValue({
      id: 1,
      name: "Dourados",
      slug: "dourados",
      state: "MS",
      summary: "Centro regional com vida cultural.",
      description: "Descrição da cidade.",
      imageUrl: "/images/cidades/dourados.jpg",
      published: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    renderWithRoute("/cidades/dourados");

    expect(await screen.findByText("Dourados")).toBeInTheDocument();
    expect(screen.getByText("Cidade do Celeiro do MS")).toBeInTheDocument();
  });

  it("deve renderizar os blocos institucionais da cidade", async () => {
    vi.mocked(publicApiClient.getPublishedCityBySlug).mockResolvedValue({
      id: 1,
      name: "Dourados",
      slug: "dourados",
      state: "MS",
      summary: "Centro regional com vida cultural.",
      description: "Descrição da cidade.",
      imageUrl: "/images/cidades/dourados.jpg",
      published: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    renderWithRoute("/cidades/dourados");

    expect(await screen.findByText("Identidade local")).toBeInTheDocument();
    expect(screen.getByText("Eventos e agenda")).toBeInTheDocument();
    expect(screen.getByText("Atrativos e descoberta")).toBeInTheDocument();
  });

  it("deve renderizar os links para eventos e pontos turísticos da cidade", async () => {
    vi.mocked(publicApiClient.getPublishedCityBySlug).mockResolvedValue({
      id: 1,
      name: "Dourados",
      slug: "dourados",
      state: "MS",
      summary: "Centro regional com vida cultural.",
      description: "Descrição da cidade.",
      imageUrl: "/images/cidades/dourados.jpg",
      published: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    renderWithRoute("/cidades/dourados");

    expect(
      await screen.findByRole("link", { name: "Ver eventos da cidade" }),
    ).toHaveAttribute("href", "/eventos?cidade=dourados");

    expect(
      screen.getByRole("link", { name: "Ver pontos turísticos" }),
    ).toHaveAttribute("href", "/pontos-turisticos?cidade=dourados");
  });

  it("deve redirecionar para a listagem quando a cidade não existir", async () => {
    vi.mocked(publicApiClient.getPublishedCityBySlug).mockResolvedValue(null);

    renderWithRoute("/cidades/cidade-inexistente");

    await waitFor(() => {
      expect(screen.getByText("Cidades índice")).toBeInTheDocument();
    });
  });

  it("deve exibir estado de erro quando a API falhar", async () => {
    vi.mocked(publicApiClient.getPublishedCityBySlug).mockRejectedValue(
      new Error("timeout"),
    );

    renderWithRoute("/cidades/dourados");

    expect(
      await screen.findByText("Erro ao carregar a cidade"),
    ).toBeInTheDocument();
    expect(screen.getByText("timeout")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Voltar para cidades" }),
    ).toHaveAttribute("href", "/cidades");
  });
});
