import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CidadesPage } from "../pages/CidadesPage";

vi.mock("@/services/public-api/publicCities.api", () => ({
  loadPublishedCitiesCatalog: vi.fn(),
}));

import { loadPublishedCitiesCatalog } from "@/services/public-api/publicCities.api";

describe("CidadesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve listar cidades quando a API responder", async () => {
    vi.mocked(loadPublishedCitiesCatalog).mockResolvedValue([
      {
        id: 1,
        name: "Dourados",
        slug: "dourados",
        state: "MS",
        summary: "Resumo.",
        description: "",
        imageUrl: "/i.jpg",
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    render(
      <MemoryRouter>
        <CidadesPage />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText("Cidades do Celeiro do MS"),
    ).toBeInTheDocument();
    expect(screen.getByText("Dourados")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Ver detalhes da cidade" }),
    ).toHaveAttribute("href", "/cidades/dourados");
  });

  it("deve exibir EmptyState quando a carga falhar", async () => {
    vi.mocked(loadPublishedCitiesCatalog).mockRejectedValue(
      new Error("falha de rede"),
    );

    render(
      <MemoryRouter>
        <CidadesPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Erro ao carregar cidades")).toBeInTheDocument();
    });
    expect(screen.getByText("falha de rede")).toBeInTheDocument();
  });
});
