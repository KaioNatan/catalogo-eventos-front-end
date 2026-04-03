export type CatalogoItemKind = "evento" | "ponto-turistico";

export interface ICatalogoItem {
  id: number;
  kind: CatalogoItemKind;
  cidadeId: number;
  cidadeSlug: string;
  titulo: string;
  descricao: string;
  imagemUrl?: string;
  categoria?: string;
  dataLabel?: string;
  localLabel?: string;
  destaque?: boolean;
  href?: string;
  ctaLabel?: string;
}

export interface ICatalogoQuery {
  cidade: string;
  busca?: string;
  categoria?: string;
  page: number;
  limit: number;
}

export interface ICatalogoResult {
  items: ICatalogoItem[];
  total: number;
  page: number;
  limit: number;
}

export interface ICatalogoPaginatedState {
  items: ICatalogoItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ICatalogoFetcherContext {
  signal?: AbortSignal;
}

export type ICatalogoFetcher = (
  query: ICatalogoQuery,
  context?: ICatalogoFetcherContext,
) => Promise<ICatalogoResult>;
