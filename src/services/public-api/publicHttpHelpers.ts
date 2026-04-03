import type { AxiosInstance } from "axios";
import { mapCityFromApi } from "@/services/api/mappers/cityFromApi";
import type { IPublicListParams } from "@/services/public-api/publicApi.types";
import { unwrapResource } from "@/services/public-api/httpPublicApiEnvelope";

export async function resolveEventCityId(
  http: AxiosInstance,
  params: IPublicListParams,
): Promise<number | undefined> {
  if (params.cityId !== undefined) {
    return params.cityId;
  }
  if (!params.citySlug) {
    return undefined;
  }
  try {
    const { data } = await http.get<unknown>(
      `/public/cities/${encodeURIComponent(params.citySlug)}`,
      { signal: params.signal },
    );
    const raw = unwrapResource<Record<string, unknown>>(data);
    const city = mapCityFromApi(raw);
    if (!city.published) {
      return undefined;
    }
    return city.id;
  } catch {
    return undefined;
  }
}

export function buildEventQuery(
  params: IPublicListParams,
  cityId?: number,
): Record<string, string | number> {
  const query: Record<string, string | number> = {
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 12),
    sortDir: "asc",
  };
  if (params.search?.trim()) {
    query.name = params.search.trim();
  }
  if (params.category?.trim()) {
    query.category = params.category.trim();
  }
  if (cityId !== undefined) {
    query.cityId = cityId;
  }
  return query;
}

export function buildTouristPointQuery(
  params: IPublicListParams,
): Record<string, string | number> {
  const query: Record<string, string | number> = {
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 12),
    published: "true",
  };
  if (params.search?.trim()) {
    query.name = params.search.trim();
  }
  if (params.citySlug?.trim()) {
    query.city = params.citySlug.trim();
  }
  return query;
}
