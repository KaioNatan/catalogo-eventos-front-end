/**
 * Cliente HTTP alinhado ao BFF (envelope `{ data, links, meta }`).
 * Base URL deve incluir o prefixo da API (ex.: `https://host/api`).
 *
 * Rotas públicas: ver `docs/architecture/frontend-api-integration.md`.
 */
import type { ICity } from "@/entities/city/city.types";
import type { IEvent } from "@/entities/event/event.types";
import type { IInstitutionalContent } from "@/entities/institutional/institutional.types";
import type { ISocialLink } from "@/entities/social-link/socialLink.types";
import type { ITouristPoint } from "@/entities/tourist-point/touristPoint.types";
import { mapCityFromApi } from "@/services/api/mappers/cityFromApi";
import { mapEventFromApi } from "@/services/api/mappers/eventFromApi";
import { mapInstitutionalFromApi } from "@/services/api/mappers/institutionalFromApi";
import { mapSocialLinkFromApi } from "@/services/api/mappers/socialLinkFromApi";
import { mapTouristPointFromApi } from "@/services/api/mappers/touristPointFromApi";
import { toApiError } from "@/services/api/apiError";
import { mapPublicHomeContentFromResource } from "@/services/public-api/mappers/mapPublicHomeContent";
import {
  buildEventQuery,
  buildTouristPointQuery,
  resolveEventCityId,
} from "@/services/public-api/publicHttpHelpers";
import axios, { type AxiosInstance, isAxiosError } from "axios";
import { unwrapCollection, unwrapResource } from "./httpPublicApiEnvelope";
import type {
  IPublicApiClient,
  IPublicHomeContentResponse,
  IPublicHomeHighlightsResponse,
  IPublicListParams,
  IPublicListResponse,
} from "./publicApi.types";

function trimBaseUrl(baseURL: string): string {
  return baseURL.replace(/\/+$/, "");
}

const MAX_BY_CITY_PAGES = 50;

export function createHttpPublicApiClient(baseURL: string): IPublicApiClient {
  const http: AxiosInstance = axios.create({
    baseURL: trimBaseUrl(baseURL),
    headers: { Accept: "application/json" },
    timeout: 30_000,
  });

  const client: IPublicApiClient = {
    async listPublishedCities(): Promise<ICity[]> {
      const { data } = await http.get<unknown>("/public/cities");
      const { items } = unwrapCollection<Record<string, unknown>>(data);
      return items
        .map((row) => mapCityFromApi(row))
        .filter((city: ICity) => city.published);
    },

    async getPublishedCityBySlug(slug: string): Promise<ICity | null> {
      try {
        const { data } = await http.get<unknown>(
          `/public/cities/${encodeURIComponent(slug)}`,
        );
        const raw = unwrapResource<Record<string, unknown>>(data);
        const city = mapCityFromApi(raw);
        if (!city.published) {
          return null;
        }
        return city;
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) {
          return null;
        }
        throw toApiError(error);
      }
    },

    async listPublishedEvents(
      params: IPublicListParams,
    ): Promise<IPublicListResponse<IEvent>> {
      const cityId = await resolveEventCityId(http, params);
      if (params.citySlug && cityId === undefined) {
        return {
          items: [],
          total: 0,
          page: params.page ?? 1,
          limit: params.limit ?? 12,
        };
      }
      const { data } = await http.get<unknown>("/public/events", {
        params: buildEventQuery(params, cityId),
        signal: params.signal,
      });
      const parsed = unwrapCollection<Record<string, unknown>>(data);
      const items = parsed.items
        .map((row) => mapEventFromApi(row))
        .filter((e) => e.published);
      return {
        items,
        total: parsed.total,
        page: parsed.page,
        limit: parsed.limit,
      };
    },

    async getPublishedEventById(id: number): Promise<IEvent | null> {
      try {
        const { data } = await http.get<unknown>(`/public/events/${id}`);
        const raw = unwrapResource<Record<string, unknown>>(data);
        const event = mapEventFromApi(raw);
        if (!event.published) {
          return null;
        }
        return event;
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) {
          return null;
        }
        throw toApiError(error);
      }
    },

    async listPublishedEventByCityId(cityId: number): Promise<IEvent[] | null> {
      const all: IEvent[] = [];
      let page = 1;
      const limit = 100;

      for (let i = 0; i < MAX_BY_CITY_PAGES; i += 1) {
        const { data } = await http.get<unknown>("/public/events", {
          params: { cityId, page, limit, sortDir: "asc" },
        });
        const parsed = unwrapCollection<Record<string, unknown>>(data);
        const batch = parsed.items
          .map((row) => mapEventFromApi(row))
          .filter((e) => e.published);
        all.push(...batch);
        if (page >= parsed.totalPages || batch.length === 0) {
          break;
        }
        page += 1;
      }

      return all;
    },

    async listPublishedTouristPoints(
      params: IPublicListParams,
    ): Promise<IPublicListResponse<ITouristPoint>> {
      const { data } = await http.get<unknown>("/public/tourist-points", {
        params: buildTouristPointQuery(params),
        signal: params.signal,
      });
      const parsed = unwrapCollection<Record<string, unknown>>(data);
      let items = parsed.items
        .map((row) => mapTouristPointFromApi(row))
        .filter((p) => p.published);

      if (params.category?.trim()) {
        items = items.filter((p) => p.category === params.category);
      }

      return {
        items,
        total: params.category?.trim() ? items.length : parsed.total,
        page: parsed.page,
        limit: parsed.limit,
      };
    },

    async getPublishedTouristPointById(
      id: number,
    ): Promise<ITouristPoint | null> {
      try {
        const { data } = await http.get<unknown>(
          `/public/tourist-points/${id}`,
        );
        const raw = unwrapResource<Record<string, unknown>>(data);
        const point = mapTouristPointFromApi(raw);
        if (!point.published) {
          return null;
        }
        return point;
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) {
          return null;
        }
        throw toApiError(error);
      }
    },

    async listPublishedTouristPointByCityId(
      cityId: number,
    ): Promise<ITouristPoint[] | null> {
      try {
        const { data: cityBody } = await http.get<unknown>(
          `/public/cities/by-id/${cityId}`,
        );
        const cityRaw = unwrapResource<Record<string, unknown>>(cityBody);
        const city = mapCityFromApi(cityRaw);
        if (!city.published) {
          return null;
        }

        const all: ITouristPoint[] = [];
        let page = 1;
        const limit = 50;

        for (let i = 0; i < MAX_BY_CITY_PAGES; i += 1) {
          const { data } = await http.get<unknown>("/public/tourist-points", {
            params: {
              page,
              limit,
              published: "true",
              city: city.slug,
            },
          });
          const parsed = unwrapCollection<Record<string, unknown>>(data);
          const batch = parsed.items
            .map((row) => mapTouristPointFromApi(row))
            .filter((p) => p.published && p.cityId === cityId);
          all.push(...batch);
          if (page >= parsed.totalPages || parsed.items.length === 0) {
            break;
          }
          page += 1;
        }

        return all;
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) {
          return null;
        }
        return null;
      }
    },

    async getInstitutionalContent(): Promise<IInstitutionalContent> {
      const { data } = await http.get<unknown>("/public/institutional-content");
      const { items } = unwrapCollection<Record<string, unknown>>(data);
      if (items.length === 0) {
        throw new Error(
          "Conteúdo institucional não encontrado na API pública.",
        );
      }
      const sorted = [...items].sort((a, b) => {
        const ta = new Date(
          String((a as Record<string, unknown>).updatedAt ?? 0),
        ).getTime();
        const tb = new Date(
          String((b as Record<string, unknown>).updatedAt ?? 0),
        ).getTime();
        return tb - ta;
      });
      return mapInstitutionalFromApi(sorted[0] as Record<string, unknown>);
    },

    async listActiveSocialLinks(): Promise<ISocialLink[]> {
      const { data } = await http.get<unknown>("/public/social-links");
      const { items } = unwrapCollection<Record<string, unknown>>(data);
      return items
        .map((row) => mapSocialLinkFromApi(row))
        .filter((link) => link.active)
        .sort((a, b) => a.order - b.order);
    },

    async getHomeHighlights(): Promise<IPublicHomeHighlightsResponse> {
      const content = await client.getHomeContent();
      const eventIds = new Set<number>();
      const touristIds = new Set<number>();

      for (const h of content.highlights) {
        if (!h.active || h.referenceId === undefined) {
          continue;
        }
        const rid = Number(h.referenceId);
        if (!Number.isFinite(rid)) {
          continue;
        }
        if (h.type === "event") {
          eventIds.add(rid);
        } else if (h.type === "tourist-point") {
          touristIds.add(rid);
        }
      }

      const events = (
        await Promise.all(
          [...eventIds].map(async (id) => {
            try {
              return await client.getPublishedEventById(id);
            } catch {
              return null;
            }
          }),
        )
      ).filter((e): e is IEvent => e !== null);

      const touristPoints = (
        await Promise.all(
          [...touristIds].map(async (id) => {
            try {
              return await client.getPublishedTouristPointById(id);
            } catch {
              return null;
            }
          }),
        )
      ).filter((p): p is ITouristPoint => p !== null);

      return { events, touristPoints };
    },

    async getHomeContent(): Promise<IPublicHomeContentResponse> {
      const { data } = await http.get<unknown>("/public/home-content");
      const payload = unwrapResource<{
        banners: Array<Record<string, unknown>>;
        highlights: Array<Record<string, unknown>>;
      }>(data);
      return mapPublicHomeContentFromResource(payload);
    },
  };

  return client;
}
