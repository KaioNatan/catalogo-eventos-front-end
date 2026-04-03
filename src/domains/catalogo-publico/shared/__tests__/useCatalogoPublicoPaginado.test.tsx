import { describe, expect, it, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useCatalogoPublicoPaginado } from "../hooks/useCatalogoPublicoPaginado";
import type {
  ICatalogoFetcher,
  ICatalogoItem,
  ICatalogoResult,
} from "../model/catalogo.types";

describe("useCatalogoPublicoPaginado", () => {
  it("deve carregar os dados iniciais", async () => {
    const fetcher: ICatalogoFetcher = vi.fn().mockResolvedValue({
      items: [
        {
          id: "evt-1",
          kind: "evento",
          cidadeId: "dourados",
          cidadeSlug: "dourados",
          titulo: "Festival",
          descricao: "Descrição",
        },
      ],
      page: 1,
      limit: 6,
      total: 1,
    });

    const baseQuery = {
      cidade: "dourados",
      limit: 6,
    };

    const { result } = renderHook(() =>
      useCatalogoPublicoPaginado({
        baseQuery,
        fetcher,
      }),
    );

    await waitFor(() => {
      expect(result.current.isInitialLoading).toBe(false);
    });

    expect(result.current.data.items).toHaveLength(1);
    expect(result.current.data.total).toBe(1);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith(
      expect.objectContaining({ cidade: "dourados", page: 1 }),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("deve carregar mais itens com loadMore", async () => {
    const fetcher: ICatalogoFetcher = vi
      .fn()
      .mockResolvedValueOnce({
        items: [
          {
            id: "evt-1",
            kind: "evento",
            cidadeId: "dourados",
            cidadeSlug: "dourados",
            titulo: "Evento 1",
            descricao: "Descrição 1",
          },
        ],
        page: 1,
        limit: 1,
        total: 2,
      })
      .mockResolvedValueOnce({
        items: [
          {
            id: "evt-2",
            kind: "evento",
            cidadeId: "dourados",
            cidadeSlug: "dourados",
            titulo: "Evento 2",
            descricao: "Descrição 2",
          },
        ],
        page: 2,
        limit: 1,
        total: 2,
      });

    const baseQuery = {
      cidade: "dourados",
      limit: 1,
    };

    const { result } = renderHook(() =>
      useCatalogoPublicoPaginado({
        baseQuery,
        fetcher,
      }),
    );

    await waitFor(() => {
      expect(result.current.isInitialLoading).toBe(false);
    });

    await act(async () => {
      await result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.data.items).toHaveLength(2);
    });

    expect(result.current.data.hasMore).toBe(false);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("deve expor erro quando a carga inicial falhar", async () => {
    const fetcher: ICatalogoFetcher = vi
      .fn()
      .mockRejectedValue(new Error("falha"));

    const baseQuery = {
      cidade: "dourados",
      limit: 6,
    };

    const { result } = renderHook(() =>
      useCatalogoPublicoPaginado({
        baseQuery,
        fetcher,
      }),
    );

    await waitFor(() => {
      expect(result.current.isInitialLoading).toBe(false);
    });

    expect(result.current.error).toBe("falha");
    expect(result.current.data.items).toHaveLength(0);
  });

  it("deve usar limite padrão quando limit for inválido", async () => {
    const fetcher: ICatalogoFetcher = vi.fn().mockResolvedValue({
      items: [],
      page: 1,
      limit: 12,
      total: 0,
    });

    renderHook(() =>
      useCatalogoPublicoPaginado({
        baseQuery: {
          cidade: "dourados",
          limit: 0,
        },
        fetcher,
      }),
    );

    await waitFor(() => {
      expect(fetcher).toHaveBeenCalledWith(
        expect.objectContaining({ limit: 12 }),
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
    });
  });

  it("não deve chamar fetcher no loadMore quando não houver mais itens", async () => {
    const fetcher: ICatalogoFetcher = vi.fn().mockResolvedValue({
      items: [
        {
          id: "1",
          kind: "evento",
          cidadeId: "d",
          cidadeSlug: "d",
          titulo: "A",
          descricao: "B",
        },
      ],
      page: 1,
      limit: 6,
      total: 1,
    });

    const { result } = renderHook(() =>
      useCatalogoPublicoPaginado({
        baseQuery: { cidade: "dourados", limit: 6 },
        fetcher,
      }),
    );

    await waitFor(() => {
      expect(result.current.isInitialLoading).toBe(false);
    });

    await act(async () => {
      await result.current.loadMore();
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("deve expor erro ao falhar no loadMore", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({
        items: [
          {
            id: "1",
            kind: "evento",
            cidadeId: "d",
            cidadeSlug: "d",
            titulo: "A",
            descricao: "B",
          },
        ],
        page: 1,
        limit: 1,
        total: 2,
      })
      .mockRejectedValueOnce(new Error("falha no load more"));

    const { result } = renderHook(() =>
      useCatalogoPublicoPaginado({
        baseQuery: { cidade: "dourados", limit: 1 },
        fetcher,
      }),
    );

    await waitFor(() => {
      expect(result.current.isInitialLoading).toBe(false);
    });

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.error).toBe("falha no load more");
  });

  it("deve recarregar os dados com reload", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      items: [
        {
          id: "1",
          kind: "evento",
          cidadeId: "d",
          cidadeSlug: "d",
          titulo: "A",
          descricao: "B",
        },
      ],
      page: 1,
      limit: 6,
      total: 1,
    });

    const { result } = renderHook(() =>
      useCatalogoPublicoPaginado({
        baseQuery: { cidade: "dourados", limit: 6 },
        fetcher,
      }),
    );

    await waitFor(() => {
      expect(result.current.isInitialLoading).toBe(false);
    });

    await act(async () => {
      await result.current.reload();
    });

    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("não deve chamar fetcher enquanto enabled for false", async () => {
    const fetcher: ICatalogoFetcher = vi.fn().mockResolvedValue({
      items: [],
      page: 1,
      limit: 6,
      total: 0,
    });

    renderHook(() =>
      useCatalogoPublicoPaginado({
        baseQuery: { cidade: "dourados", limit: 6 },
        fetcher,
        enabled: false,
      }),
    );

    await new Promise((r) => {
      setTimeout(r, 50);
    });

    expect(fetcher).not.toHaveBeenCalled();
  });

  it("não define erro quando o fetcher rejeita com requisição cancelada", async () => {
    const fetcher: ICatalogoFetcher = vi
      .fn()
      .mockRejectedValue({ code: "ERR_CANCELED", message: "canceled" });

    const { result } = renderHook(() =>
      useCatalogoPublicoPaginado({
        baseQuery: { cidade: "dourados", limit: 6 },
        fetcher,
      }),
    );

    await waitFor(() => {
      expect(result.current.isInitialLoading).toBe(false);
    });

    expect(result.current.error).toBeNull();
  });

  it("mantém itens e expõe isStaleListRefreshing durante refetch com staleWhileRevalidate", async () => {
    const itemA: ICatalogoItem = {
      id: 1,
      kind: "evento",
      cidadeId: 1,
      cidadeSlug: "dourados",
      titulo: "A",
      descricao: "d",
    };
    const itemB: ICatalogoItem = {
      id: 2,
      kind: "evento",
      cidadeId: 1,
      cidadeSlug: "dourados",
      titulo: "B",
      descricao: "d",
    };

    let resolveSecond!: (value: ICatalogoResult) => void;
    const secondPromise = new Promise<ICatalogoResult>((resolve) => {
      resolveSecond = resolve;
    });

    const fetcher = vi
      .fn()
      .mockResolvedValueOnce({
        items: [itemA],
        page: 1,
        limit: 6,
        total: 1,
      })
      .mockImplementationOnce(() => secondPromise);

    const { result, rerender } = renderHook(
      ({ busca }: { busca: string }) =>
        useCatalogoPublicoPaginado({
          baseQuery: { cidade: "dourados", busca, limit: 6 },
          fetcher,
          loading: { staleWhileRevalidate: true },
        }),
      { initialProps: { busca: "" } },
    );

    await waitFor(() => {
      expect(result.current.isInitialLoading).toBe(false);
    });

    expect(result.current.data.items[0]?.id).toBe(1);

    rerender({ busca: "fest" });

    await waitFor(() => {
      expect(result.current.isStaleListRefreshing).toBe(true);
    });

    expect(result.current.data.items).toHaveLength(1);
    expect(result.current.data.items[0]?.id).toBe(1);

    await act(async () => {
      resolveSecond({
        items: [itemB],
        page: 1,
        limit: 6,
        total: 1,
      });
    });

    await waitFor(() => {
      expect(result.current.isStaleListRefreshing).toBe(false);
    });

    expect(result.current.data.items[0]?.id).toBe(2);
  });

  it("aplica minSkeletonMs antes de encerrar isInitialLoading na primeira carga", async () => {
    vi.useFakeTimers();

    const fetcher: ICatalogoFetcher = vi.fn().mockResolvedValue({
      items: [
        {
          id: 1,
          kind: "evento",
          cidadeId: 1,
          cidadeSlug: "dourados",
          titulo: "A",
          descricao: "B",
        },
      ],
      page: 1,
      limit: 6,
      total: 1,
    });

    const { result } = renderHook(() =>
      useCatalogoPublicoPaginado({
        baseQuery: { cidade: "dourados", limit: 6 },
        fetcher,
        loading: { minSkeletonMs: 400 },
      }),
    );

    expect(result.current.isInitialLoading).toBe(true);

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(fetcher).toHaveBeenCalled();
    expect(result.current.isInitialLoading).toBe(true);
    expect(result.current.data.items).toHaveLength(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(399);
    });
    expect(result.current.isInitialLoading).toBe(true);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });

    expect(result.current.isInitialLoading).toBe(false);

    vi.useRealTimers();
  });
});
