import { EVENT_CATEGORY_OPTIONS } from "@/constants/contentCategories";
import type { ICatalogoFiltersConfig } from "@/domains/catalogo-publico/shared/model/catalogo.filters";

export const eventosFiltersConfig: ICatalogoFiltersConfig = {
  searchPlaceholder: "Busque um evento por nome",
  categorias: EVENT_CATEGORY_OPTIONS.map(({ label, value }) => ({
    label,
    value,
  })),
};
