/**
 * Extensão de UX de carregamento do catálogo público (Fase 3), consumida por
 * `useCatalogoPublicoPaginado` e constantes como `CATALOGO_PUBLICO_LIST_LOADING_DEFAULT`.
 *
 * - `staleWhileRevalidate`: mantém a lista anterior com overlay no refetch
 *   (combinar com `CatalogListingShell` em `displayMode="stale-overlay"` + `staleLayer`).
 * - `minSkeletonMs`: tempo mínimo de skeleton na primeira carga (quando não há overlay stale);
 *   evita flash quando a API responde muito rápido.
 *
 * Fora deste hook (também Fase 3): listagens admin usam `AdminCrmListTableSkeleton`;
 * RUM para debounce/percepção fica para instrumentação futura (ex. tag manager / Web Vitals).
 */
export interface ICatalogoPublicoLoadingExtension {
  staleWhileRevalidate?: boolean;
  minSkeletonMs?: number;
}
