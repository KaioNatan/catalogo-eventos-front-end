export interface ICatalogoFilterOption {
  label: string;
  value: string;
}

export interface ICatalogoFiltersValue {
  busca: string;
  categoria: string;
}

export interface ICatalogoFiltersConfig {
  title?: string;
  searchPlaceholder?: string;
  categorias: ICatalogoFilterOption[];
}
