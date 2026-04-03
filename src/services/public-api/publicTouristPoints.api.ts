import type { ITouristPoint } from "@/entities/tourist-point/touristPoint.types";
import { publicApiClient } from "@/services/public-api/client";
import type {
  IPublicListParams,
  IPublicListResponse,
} from "@/services/public-api/publicApi.types";

/**
 * Listagem paginada de pontos turísticos publicados (delega ao cliente HTTP).
 * O domínio do catálogo consome esta função em vez do singleton `publicApiClient`.
 */
export function loadPublishedTouristPointsCatalog(
  params: IPublicListParams,
): Promise<IPublicListResponse<ITouristPoint>> {
  return publicApiClient.listPublishedTouristPoints(params);
}
