import { Section, SectionHeader } from "@/design-system/ui";
import { CatalogFilters } from "@/domains/catalogo-publico/shared/components/CatalogFilters";
import { CatalogFiltersSkeleton } from "@/domains/catalogo-publico/shared/components/CatalogFiltersSkeleton";
import { CatalogGrid } from "@/domains/catalogo-publico/shared/components/CatalogGrid";
import { CatalogListingShell } from "@/domains/catalogo-publico/shared/components/CatalogListingShell";
import { EmptyState } from "@/domains/catalogo-publico/shared/components/EmptyState";
import { LoadMoreButton } from "@/domains/catalogo-publico/shared/components/LoadMoreButton";
import { CATALOGO_PUBLICO_LIST_LOADING_DEFAULT } from "@/domains/catalogo-publico/shared/constants/catalogoPublicoListLoading";
import { CATALOGO_PUBLICO_SEARCH_DEBOUNCE_MS } from "@/domains/catalogo-publico/shared/constants/catalogoPublicoSearchDebounce";
import { useCatalogoCidade } from "@/domains/catalogo-publico/shared/hooks/useCatalogoCidade";
import { useCatalogoPublicoPaginado } from "@/domains/catalogo-publico/shared/hooks/useCatalogoPublicoPaginado";
import type { ICatalogoFiltersValue } from "@/domains/catalogo-publico/shared/model/catalogo.filters";
import type { ICatalogoQuery } from "@/domains/catalogo-publico/shared/model/catalogo.types";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { usePublicPageMetadata } from "@/shell/public/seo/usePublicPageMetadata";
import { useMemo, useState, type ReactElement } from "react";
import { fetchEventosCatalogo } from "../config/eventosCatalogConfig";
import { eventosFiltersConfig } from "../config/eventosFiltersConfig";

export function EventosPage(): ReactElement {
  usePublicPageMetadata({
    title: "Eventos | Celeiro do MS",
    description:
      "Agenda de eventos no Mato Grosso do Sul — festivais, cultura e experiências.",
    canonicalPath: "/eventos",
  });

  const {
    cidadeSlug,
    cidadeNome,
    cidades,
    setCidadeSlug,
    isLoadingCidades,
    errorCidades,
    isCitiesReady,
  } = useCatalogoCidade();

  const [filters, setFilters] = useState<ICatalogoFiltersValue>({
    busca: "",
    categoria: "",
  });

  const debouncedBusca: string = useDebouncedValue(
    filters.busca,
    CATALOGO_PUBLICO_SEARCH_DEBOUNCE_MS,
  );

  const baseQuery: Omit<ICatalogoQuery, "page"> = useMemo(
    () => ({
      cidade: cidadeSlug,
      busca: debouncedBusca,
      categoria: filters.categoria,
      limit: 6,
    }),
    [cidadeSlug, debouncedBusca, filters.categoria],
  );

  const {
    data,
    isInitialLoading,
    isStaleListRefreshing,
    isLoadingMore,
    error,
    loadMore,
  } = useCatalogoPublicoPaginado({
    baseQuery,
    fetcher: fetchEventosCatalogo,
    enabled: isCitiesReady,
    loading: CATALOGO_PUBLICO_LIST_LOADING_DEFAULT,
  });

  const showFullSkeleton: boolean =
    isCitiesReady && isInitialLoading && !isStaleListRefreshing;
  const showGridError: boolean = isCitiesReady && Boolean(error);
  const isEmpty: boolean =
    isCitiesReady && !isInitialLoading && !error && data.items.length === 0;

  return (
    <Section spacing="xl">
      <SectionHeader description="Explore a agenda da cidade selecionada.">
        Eventos em {cidadeNome || "…"}
      </SectionHeader>

      {errorCidades ? (
        <div className="mt-8">
          <EmptyState
            title="Erro ao carregar cidades"
            description={errorCidades}
          />
        </div>
      ) : null}

      {!errorCidades && isLoadingCidades ? (
        <div className="mt-8">
          <CatalogFiltersSkeleton />
        </div>
      ) : null}

      {!errorCidades && !isLoadingCidades ? (
        <div className="mt-8">
          <CatalogFilters
            cidadeSlug={cidadeSlug}
            cidades={cidades}
            value={filters}
            onCidadeChange={setCidadeSlug}
            onChange={setFilters}
            config={eventosFiltersConfig}
          />
        </div>
      ) : null}

      <CatalogListingShell
        showSkeleton={showFullSkeleton || isStaleListRefreshing}
        displayMode={isStaleListRefreshing ? "stale-overlay" : "replace"}
        staleLayer={
          isStaleListRefreshing ? (
            <>
              <CatalogGrid items={data.items} />
              {data.hasMore ? (
                <LoadMoreButton
                  isLoading={isLoadingMore}
                  onClick={loadMore}
                  disabled
                />
              ) : null}
            </>
          ) : undefined
        }
        skeletonCount={6}
      >
        <>
          {showGridError && error ? (
            <EmptyState title="Erro ao carregar eventos" description={error} />
          ) : null}

          {isEmpty ? (
            <EmptyState
              title="Nenhum evento encontrado"
              description="Tente mudar a cidade, a busca ou a categoria."
            />
          ) : null}

          {!isInitialLoading &&
          !error &&
          isCitiesReady &&
          data.items.length > 0 ? (
            <>
              <CatalogGrid items={data.items} />
              {data.hasMore ? (
                <LoadMoreButton isLoading={isLoadingMore} onClick={loadMore} />
              ) : null}
            </>
          ) : null}
        </>
      </CatalogListingShell>
    </Section>
  );
}
