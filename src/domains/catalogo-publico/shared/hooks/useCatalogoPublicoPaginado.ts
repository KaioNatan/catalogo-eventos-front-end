import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toApiError } from "@/services/api/apiError";
import type { ICatalogoPublicoLoadingExtension } from "../model/catalogoPublicoLoadingExtension";
import type {
  ICatalogoFetcher,
  ICatalogoFetcherContext,
  ICatalogoPaginatedState,
  ICatalogoQuery,
  ICatalogoResult,
} from "../model/catalogo.types";
import { isRequestAborted } from "../utils/isRequestAborted";

interface IUseCatalogoPublicoPaginadoParams {
  baseQuery: Omit<ICatalogoQuery, "page">;
  fetcher: ICatalogoFetcher;
  initialPage?: number;
  enabled?: boolean;
  loading?: ICatalogoPublicoLoadingExtension;
}

interface IUseCatalogoPublicoPaginadoResult {
  data: ICatalogoPaginatedState;
  isInitialLoading: boolean;
  /** Lista anterior visível com overlay (stale-while-revalidate). */
  isStaleListRefreshing: boolean;
  isLoadingMore: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  reload: () => Promise<void>;
}

const DEFAULT_LIMIT = 12;

function buildInitialState(limit: number): ICatalogoPaginatedState {
  return {
    items: [],
    total: 0,
    page: 1,
    limit,
    hasMore: false,
  };
}

function sleepMs(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function useCatalogoPublicoPaginado(
  params: IUseCatalogoPublicoPaginadoParams,
): IUseCatalogoPublicoPaginadoResult {
  const {
    baseQuery,
    fetcher,
    initialPage = 1,
    enabled = true,
    loading: loadingOpts,
  } = params;

  const staleWhileRevalidate: boolean = Boolean(
    loadingOpts?.staleWhileRevalidate,
  );
  const minSkeletonMs: number = loadingOpts?.minSkeletonMs ?? 0;

  const cidade: string = baseQuery.cidade;
  const busca: string | undefined = baseQuery.busca;
  const categoria: string | undefined = baseQuery.categoria;
  const safeLimit: number =
    baseQuery.limit > 0 ? baseQuery.limit : DEFAULT_LIMIT;

  const [data, setData] = useState<ICatalogoPaginatedState>(
    buildInitialState(safeLimit),
  );
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const latestItemCountRef = useRef<number>(0);

  useEffect(() => {
    latestItemCountRef.current = data.items.length;
  }, [data.items.length]);

  const stableBaseQuery = useMemo(
    () => ({
      cidade,
      busca,
      categoria,
      limit: safeLimit,
    }),
    [cidade, busca, categoria, safeLimit],
  );

  const executeFetch = useCallback(
    async (
      page: number,
      append: boolean,
      context?: ICatalogoFetcherContext,
    ): Promise<void> => {
      const query: ICatalogoQuery = {
        ...stableBaseQuery,
        page,
      };

      const response: ICatalogoResult = await fetcher(query, context);

      if (context?.signal?.aborted) {
        return;
      }

      setData((currentState: ICatalogoPaginatedState) => {
        const nextItems = append
          ? [...currentState.items, ...response.items]
          : response.items;

        const loadedItemsCount: number = nextItems.length;
        const hasMore: boolean = loadedItemsCount < response.total;

        return {
          items: nextItems,
          total: response.total,
          page: response.page,
          limit: response.limit,
          hasMore,
        };
      });
    },
    [fetcher, stableBaseQuery],
  );

  const finishInitialLoadingWithOptionalMinDelay = useCallback(
    async (
      isActive: () => boolean,
      syncStartedAt: number,
      useMinSkeleton: boolean,
    ): Promise<void> => {
      if (!isActive()) {
        return;
      }
      if (useMinSkeleton && minSkeletonMs > 0) {
        const elapsed: number = Date.now() - syncStartedAt;
        const wait: number = Math.max(0, minSkeletonMs - elapsed);
        if (wait > 0) {
          await sleepMs(wait);
        }
      }
      if (!isActive()) {
        return;
      }
      setIsInitialLoading(false);
    },
    [minSkeletonMs],
  );

  const reload = useCallback(async (): Promise<void> => {
    if (!enabled) {
      return;
    }

    const hadItems: boolean = latestItemCountRef.current > 0;
    const useStaleOverlay: boolean = staleWhileRevalidate && hadItems;
    const useMinSkeleton: boolean = minSkeletonMs > 0 && !useStaleOverlay;
    const t0: number = Date.now();

    try {
      setIsInitialLoading(true);
      setError(null);
      await executeFetch(initialPage, false);
    } catch (caught) {
      if (!isRequestAborted(caught)) {
        setError(toApiError(caught).message);
        if (!staleWhileRevalidate) {
          setData(buildInitialState(safeLimit));
        }
      }
    } finally {
      await finishInitialLoadingWithOptionalMinDelay(
        () => true,
        t0,
        useMinSkeleton,
      );
    }
  }, [
    enabled,
    executeFetch,
    initialPage,
    minSkeletonMs,
    safeLimit,
    staleWhileRevalidate,
    finishInitialLoadingWithOptionalMinDelay,
  ]);

  const loadMore = useCallback(async (): Promise<void> => {
    if (!enabled || isLoadingMore || isInitialLoading || !data.hasMore) {
      return;
    }

    try {
      setIsLoadingMore(true);
      setError(null);
      await executeFetch(data.page + 1, true);
    } catch (caught) {
      if (isRequestAborted(caught)) {
        return;
      }
      setError(toApiError(caught).message);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    data.hasMore,
    data.page,
    enabled,
    executeFetch,
    isInitialLoading,
    isLoadingMore,
  ]);

  useEffect(() => {
    if (!enabled) {
      setData(buildInitialState(safeLimit));
      setIsInitialLoading(true);
      setError(null);
      return;
    }

    let isActive: boolean = true;
    const abortController: AbortController = new AbortController();

    async function syncData(): Promise<void> {
      const hadItems: boolean = latestItemCountRef.current > 0;
      const useStaleOverlay: boolean = staleWhileRevalidate && hadItems;
      const useMinSkeleton: boolean = minSkeletonMs > 0 && !useStaleOverlay;
      const t0: number = Date.now();

      try {
        setIsInitialLoading(true);
        setError(null);

        await executeFetch(initialPage, false, {
          signal: abortController.signal,
        });

        if (!isActive) {
          return;
        }
      } catch (caught) {
        if (!isActive || isRequestAborted(caught)) {
          return;
        }

        setError(toApiError(caught).message);
        if (!staleWhileRevalidate) {
          setData(buildInitialState(safeLimit));
        }
      } finally {
        await finishInitialLoadingWithOptionalMinDelay(
          () => isActive,
          t0,
          useMinSkeleton,
        );
      }
    }

    void syncData();

    return () => {
      isActive = false;
      abortController.abort();
    };
  }, [
    enabled,
    executeFetch,
    finishInitialLoadingWithOptionalMinDelay,
    initialPage,
    minSkeletonMs,
    safeLimit,
    stableBaseQuery,
    staleWhileRevalidate,
  ]);

  const isStaleListRefreshing: boolean =
    staleWhileRevalidate && isInitialLoading && data.items.length > 0;

  return {
    data,
    isInitialLoading,
    isStaleListRefreshing,
    isLoadingMore,
    error,
    loadMore,
    reload,
  };
}
