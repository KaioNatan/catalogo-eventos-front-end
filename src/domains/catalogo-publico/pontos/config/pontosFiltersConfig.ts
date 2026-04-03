import { TOURIST_POINT_CATEGORY_OPTIONS } from "@/constants/contentCategories";
import type { ICatalogoFiltersConfig } from "@/domains/catalogo-publico/shared/model/catalogo.filters";

export const pontosFiltersConfig: ICatalogoFiltersConfig = {
  searchPlaceholder: "Busque um ponto turístico por nome",
  categorias: TOURIST_POINT_CATEGORY_OPTIONS.map(({ label, value }) => ({
    label,
    value,
  })),
};
