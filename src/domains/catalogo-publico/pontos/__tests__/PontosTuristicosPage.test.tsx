import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PontosTuristicosPage } from "../pages/PontosTuristicosPage";

vi.mock("@/domains/catalogo-publico/shared/hooks/useCatalogoCidade", () => ({
  useCatalogoCidade: vi.fn(),
}));

vi.mock(
  "@/domains/catalogo-publico/shared/hooks/useCatalogoPublicoPaginado",
  () => ({
    useCatalogoPublicoPaginado: vi.fn(),
  }),
);

import { useCatalogoCidade } from "@/domains/catalogo-publico/shared/hooks/useCatalogoCidade";
import { useCatalogoPublicoPaginado } from "@/domains/catalogo-publico/shared/hooks/useCatalogoPublicoPaginado";

describe("PontosTuristicosPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCatalogoCidade).mockReturnValue({
      cidadeSlug: "dourados",
      cidadeNome: "Dourados",
      isLoadingCidades: false,
      errorCidades: null,
      isCitiesReady: true,
      cidades: [
        {
          id: 1,
          name: "Dourados",
          slug: "dourados",
          state: "MS",
          published: true,
          summary: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 2,
          name: "Itaporã",
          slug: "itapora",
          state: "MS",
          published: true,
          summary: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      handleCidadeChange: vi.fn(),
      setCidadeSlug: vi.fn(),
    });
  });

  it("deve renderizar o título da página", () => {
    vi.mocked(useCatalogoPublicoPaginado).mockReturnValue({
      data: {
        items: [],
        total: 0,
        page: 1,
        limit: 6,
        hasMore: false,
      },
      isInitialLoading: true,
      isStaleListRefreshing: false,
      isLoadingMore: false,
      error: null,
      loadMore: vi.fn(),
      reload: vi.fn(),
    });

    render(
      <MemoryRouter>
        <PontosTuristicosPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByText("Pontos turísticos em Dourados"),
    ).toBeInTheDocument();
  });

  it("deve renderizar os itens da listagem", () => {
    vi.mocked(useCatalogoPublicoPaginado).mockReturnValue({
      data: {
        items: [
          {
            id: 1,
            kind: "ponto-turistico",
            cidadeId: 1,
            cidadeSlug: "dourados",
            titulo: "Parque Antenor Martins",
            descricao: "Área verde com espaço de lazer.",
            categoria: "Parque",
            localLabel: "Rua Antônio Emílio de Figueiredo",
            href: "/pontos-turisticos/pto-1",
            ctaLabel: "Ver local",
          },
        ],
        total: 1,
        page: 1,
        limit: 6,
        hasMore: false,
      },
      isInitialLoading: false,
      isStaleListRefreshing: false,
      isLoadingMore: false,
      error: null,
      loadMore: vi.fn(),
      reload: vi.fn(),
    });

    render(
      <MemoryRouter>
        <PontosTuristicosPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Parque Antenor Martins")).toBeInTheDocument();

    expect(
      screen.getByText("Área verde com espaço de lazer."),
    ).toBeInTheDocument();
  });

  it("deve renderizar estado vazio", () => {
    vi.mocked(useCatalogoPublicoPaginado).mockReturnValue({
      data: {
        items: [],
        total: 0,
        page: 1,
        limit: 6,
        hasMore: false,
      },
      isInitialLoading: false,
      isStaleListRefreshing: false,
      isLoadingMore: false,
      error: null,
      loadMore: vi.fn(),
      reload: vi.fn(),
    });

    render(
      <MemoryRouter>
        <PontosTuristicosPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByText("Nenhum ponto turístico encontrado"),
    ).toBeInTheDocument();
  });

  it("deve renderizar estado de erro", () => {
    vi.mocked(useCatalogoPublicoPaginado).mockReturnValue({
      data: {
        items: [],
        total: 0,
        page: 1,
        limit: 6,
        hasMore: false,
      },
      isInitialLoading: false,
      isStaleListRefreshing: false,
      isLoadingMore: false,
      error: "Não foi possível carregar os dados.",
      loadMore: vi.fn(),
      reload: vi.fn(),
    });

    render(
      <MemoryRouter>
        <PontosTuristicosPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByText("Erro ao carregar pontos turísticos"),
    ).toBeInTheDocument();
  });

  it("deve renderizar botão de carregar mais quando houver mais itens", () => {
    vi.mocked(useCatalogoPublicoPaginado).mockReturnValue({
      data: {
        items: [
          {
            id: 1,
            kind: "ponto-turistico",
            cidadeId: 1,
            cidadeSlug: "dourados",
            titulo: "Parque Antenor Martins",
            descricao: "Área verde com espaço de lazer.",
            href: "/pontos-turisticos/pto-1",
          },
        ],
        total: 10,
        page: 1,
        limit: 6,
        hasMore: true,
      },
      isInitialLoading: false,
      isStaleListRefreshing: false,
      isLoadingMore: false,
      error: null,
      loadMore: vi.fn(),
      reload: vi.fn(),
    });

    render(
      <MemoryRouter>
        <PontosTuristicosPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("button", { name: /carregar mais/i }),
    ).toBeInTheDocument();
  });
});
