import { labelForTouristPointCategory } from "@/constants/contentCategories";
import type { ITouristPoint } from "@/entities/tourist-point/touristPoint.types";
import { loadPublishedTouristPointsCatalog } from "@/services/public-api/publicTouristPoints.api";
import type {
  ICatalogoFetcherContext,
  ICatalogoItem,
  ICatalogoQuery,
  ICatalogoResult,
} from "../../shared/model/catalogo.types";

function mapTouristPointToCatalogItem(
  touristPoint: ITouristPoint,
): ICatalogoItem {
  return {
    id: touristPoint.id,
    kind: "ponto-turistico",
    cidadeId: touristPoint.cityId,
    cidadeSlug: touristPoint.citySlug,
    titulo: touristPoint.name,
    descricao: touristPoint.description,
    imagemUrl: touristPoint.imageUrl,
    categoria: touristPoint.category
      ? labelForTouristPointCategory(touristPoint.category)
      : undefined,
    localLabel: touristPoint.address,
    destaque: touristPoint.featured,
    href: `/pontos-turisticos/${touristPoint.id}`,
    ctaLabel: "Ver local",
  };
}

export async function fetchPontosCatalogo(
  query: ICatalogoQuery,
  context?: ICatalogoFetcherContext,
): Promise<ICatalogoResult> {
  const response = await loadPublishedTouristPointsCatalog({
    citySlug: query.cidade,
    search: query.busca,
    category: query.categoria,
    page: query.page,
    limit: query.limit,
    signal: context?.signal,
  });

  return {
    items: response.items.map(mapTouristPointToCatalogItem),
    total: response.total,
    page: response.page,
    limit: response.limit,
  };
}
