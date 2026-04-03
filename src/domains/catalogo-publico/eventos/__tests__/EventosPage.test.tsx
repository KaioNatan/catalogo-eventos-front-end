import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CATALOGO_PUBLICO_SEARCH_DEBOUNCE_MS } from "@/domains/catalogo-publico/shared/constants/catalogoPublicoSearchDebounce";
import { EventosPage } from "../pages/EventosPage";

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

describe("EventosPage", () => {
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

  it("deve renderizar loading inicial", () => {
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
        <EventosPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Eventos em Dourados")).toBeInTheDocument();
  });

  it("deve renderizar os itens da listagem", () => {
    vi.mocked(useCatalogoPublicoPaginado).mockReturnValue({
      data: {
        items: [
          {
            id: 1,
            kind: "evento",
            cidadeId: 1,
            cidadeSlug: "dourados",
            titulo: "Festival Gastronômico",
            descricao: "Sabores regionais",
            categoria: "Gastronomia",
            dataLabel: "20 a 22 de março de 2026",
            localLabel: "Parque dos Ipês",
            href: "/eventos/evt-1",
            ctaLabel: "Ver evento",
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
        <EventosPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Festival Gastronômico")).toBeInTheDocument();

    expect(screen.getByText("Sabores regionais")).toBeInTheDocument();
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
        <EventosPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Nenhum evento encontrado")).toBeInTheDocument();
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
        <EventosPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Erro ao carregar eventos")).toBeInTheDocument();

    expect(
      screen.getByText("Não foi possível carregar os dados."),
    ).toBeInTheDocument();
  });

  it("deve renderizar botão de carregar mais quando houver mais itens", () => {
    vi.mocked(useCatalogoPublicoPaginado).mockReturnValue({
      data: {
        items: [
          {
            id: 1,
            kind: "evento",
            cidadeId: 1,
            cidadeSlug: "dourados",
            titulo: "Festival Gastronômico",
            descricao: "Sabores regionais",
            href: "/eventos/evt-1",
          },
        ],
        total: 10,
        page: 1,
        limit: 6,
        hasMore: true,
      },
      isInitialLoading: false,
      isStaleListRefreshing: false,
      isLoadingMore: true,
      error: null,
      loadMore: vi.fn(),
      reload: vi.fn(),
    });

    render(
      <MemoryRouter>
        <EventosPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("button", { name: /carregando/i }),
    ).toBeInTheDocument();
  });

  it("só envia busca para o hook após debounce da digitação", async () => {
    vi.useFakeTimers();
    const captured: Array<{ busca?: string; categoria?: string }> = [];
    vi.mocked(useCatalogoPublicoPaginado).mockImplementation((params) => {
      captured.push({ ...params.baseQuery });
      return {
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
      };
    });

    try {
      render(
        <MemoryRouter>
          <EventosPage />
        </MemoryRouter>,
      );

      fireEvent.change(screen.getByLabelText("Buscar"), {
        target: { value: "festival" },
      });

      expect(captured[captured.length - 1]?.busca).toBe("");

      await act(async () => {
        vi.advanceTimersByTime(CATALOGO_PUBLICO_SEARCH_DEBOUNCE_MS);
      });

      expect(captured[captured.length - 1]?.busca).toBe("festival");
    } finally {
      vi.useRealTimers();
    }
  });
});
