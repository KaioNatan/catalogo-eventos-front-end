import { labelForEventCategory } from "@/constants/contentCategories";
import type { IEvent } from "@/entities/event/event.types";
import { publicApiClient } from "@/services/public-api/client";
import type {
  ICatalogoFetcherContext,
  ICatalogoItem,
  ICatalogoQuery,
  ICatalogoResult,
} from "../../shared/model/catalogo.types";

function mapEventToCatalogItem(event: IEvent): ICatalogoItem {
  return {
    id: event.id,
    kind: "evento",
    cidadeId: event.cityId,
    cidadeSlug: event.citySlug,
    titulo: event.name,
    descricao: event.description,
    imagemUrl: event.imageUrl,
    categoria: event.category
      ? labelForEventCategory(event.category)
      : undefined,
    dataLabel: event.formattedDate,
    localLabel: event.location,
    destaque: event.featured,
    href: `/eventos/${event.id}`,
    ctaLabel: "Ver evento",
  };
}

export async function fetchEventosCatalogo(
  query: ICatalogoQuery,
  context?: ICatalogoFetcherContext,
): Promise<ICatalogoResult> {
  const response = await publicApiClient.listPublishedEvents({
    citySlug: query.cidade,
    search: query.busca,
    category: query.categoria,
    page: query.page,
    limit: query.limit,
    signal: context?.signal,
  });

  return {
    items: response.items.map(mapEventToCatalogItem),
    total: response.total,
    page: response.page,
    limit: response.limit,
  };
}
