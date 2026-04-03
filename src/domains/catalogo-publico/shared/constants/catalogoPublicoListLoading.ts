import type { ICatalogoPublicoLoadingExtension } from "../model/catalogoPublicoLoadingExtension";

/** Padrão do catálogo público: overlay na lista ao refetch + skeleton mínimo na primeira carga. */
export const CATALOGO_PUBLICO_LIST_LOADING_DEFAULT: ICatalogoPublicoLoadingExtension =
  {
    staleWhileRevalidate: true,
    minSkeletonMs: 200,
  };
