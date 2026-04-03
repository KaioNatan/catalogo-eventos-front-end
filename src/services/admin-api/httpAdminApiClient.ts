import type {
  ICreateInstitutionalContentInput,
  IInstitutionalContent,
  IUpdateInstitutionalContentInput,
} from "@/entities/institutional/institutional.types";
import type {
  ICreateSocialLinkInput,
  ISocialLink,
  IUpdateSocialLinkInput,
} from "@/entities/social-link/socialLink.types";
import type {
  ICity,
  ICreateCityInput,
  IUpdateCityInput,
} from "@/entities/city/city.types";
import type {
  ICreateEventInput,
  IEvent,
  IUpdateEventInput,
} from "@/entities/event/event.types";
import type {
  ICreateTouristPointInput,
  ITouristPoint,
  IUpdateTouristPointInput,
} from "@/entities/tourist-point/touristPoint.types";
import type {
  ICreateHomeBannerInput,
  ICreateHomeHighlightInput,
  IHomeBanner,
  IHomeHighlight,
  IUpdateHomeBannerInput,
  IUpdateHomeHighlightInput,
} from "@/entities/home-content/homeContent.types";
import type { IAdminApiClient, IAdminListPickQuery } from "./adminApi.types";
import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  isAxiosError,
} from "axios";
import { toApiError } from "@/services/api/apiError";
import { unwrapCollection, unwrapResource } from "@/services/api/httpEnvelope";
import { mapCityFromApi } from "@/services/api/mappers/cityFromApi";
import { mapEventFromApi } from "@/services/api/mappers/eventFromApi";
import { mapHomeBannerFromApi } from "@/services/api/mappers/homeBannerFromApi";
import { mapHomeHighlightFromApi } from "@/services/api/mappers/homeHighlightFromApi";
import { mapInstitutionalFromApi } from "@/services/api/mappers/institutionalFromApi";
import { mapSocialLinkFromApi } from "@/services/api/mappers/socialLinkFromApi";
import { mapTouristPointFromApi } from "@/services/api/mappers/touristPointFromApi";
import {
  assertAdminHttpSessionBridgeRegistered,
  readAdminHttpSession,
} from "./adminHttpSessionBridge";
import { refreshAdminAccessTokenSingleFlight } from "./adminAccessTokenRefreshCoordinator";
import { notifyAdminAuthForbidden } from "./adminAuthEvents";
import { resolveWebImagePayloadFromImageUrlField } from "./adminWebImage";

function trimBaseUrl(baseURL: string): string {
  return baseURL.replace(/\/+$/, "");
}

/** Query params comuns para listagens admin em modo "pick" (eventos, pontos turísticos, etc.). */
function buildAdminListPickParams(
  query?: IAdminListPickQuery,
): Record<string, string | number> {
  const out: Record<string, string | number> = {
    page: query?.page ?? 1,
    limit: query?.limit ?? 30,
    sortDir: "asc",
  };
  if (query?.search?.trim()) {
    out.name = query.search.trim();
  }
  if (query?.category?.trim()) {
    out.category = query.category.trim();
  }
  return out;
}

function createAdminAxios(baseURL: string): AxiosInstance {
  const http = axios.create({
    baseURL: trimBaseUrl(baseURL),
    headers: { Accept: "application/json" },
    timeout: 60_000,
  });

  http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const session = readAdminHttpSession();
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  });

  http.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (!isAxiosError(error) || !error.config) {
        return Promise.reject(error);
      }

      if (error.response?.status === 403) {
        notifyAdminAuthForbidden();
        return Promise.reject(error);
      }

      const original = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      const reqUrl = original.url ?? "";

      if (
        !error.response ||
        error.response.status !== 401 ||
        original._retry ||
        reqUrl.includes("/auth/login") ||
        reqUrl.includes("/auth/refresh-token")
      ) {
        return Promise.reject(error);
      }

      original._retry = true;

      try {
        const nextAccess = await refreshAdminAccessTokenSingleFlight(baseURL);
        original.headers.Authorization = `Bearer ${nextAccess}`;
        return http.request(original);
      } catch {
        return Promise.reject(error);
      }
    },
  );

  return http;
}

/**
 * Lista via GET /admin/institutional-content (fonte de verdade para o singleton).
 * Ordena por updatedAt descendente; o primeiro item é o registro canônico quando há um só.
 */
async function listInstitutionalSorted(
  http: AxiosInstance,
): Promise<IInstitutionalContent[]> {
  const { data } = await http.get<unknown>("/admin/institutional-content");
  const { items } = unwrapCollection<Record<string, unknown>>(data);
  if (items.length === 0) {
    return [];
  }
  const mapped: IInstitutionalContent[] = items.map((row) =>
    mapInstitutionalFromApi(row as Record<string, unknown>),
  );
  return mapped.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

async function pickInstitutional(
  http: AxiosInstance,
): Promise<IInstitutionalContent | null> {
  const list: IInstitutionalContent[] = await listInstitutionalSorted(http);
  return list[0] ?? null;
}

export function createHttpAdminApiClient(baseURL: string): IAdminApiClient {
  assertAdminHttpSessionBridgeRegistered();
  const http = createAdminAxios(baseURL);

  return {
    async getInstitutionalContent(): Promise<IInstitutionalContent | null> {
      return pickInstitutional(http);
    },

    async createInstitutionalContent(
      input: ICreateInstitutionalContentInput,
    ): Promise<IInstitutionalContent> {
      const body: Record<string, unknown> = {
        aboutTitle: input.aboutTitle,
        aboutText: input.aboutText,
        whoWeAreTitle: input.whoWeAreTitle,
        whoWeAreText: input.whoWeAreText,
        purposeTitle: input.purposeTitle,
        purposeText: input.purposeText,
        mission: input.mission,
        vision: input.vision,
        valuesJson: JSON.stringify(input.values),
      };
      const { data } = await http.post<unknown>(
        "/admin/institutional-content",
        body,
      );
      const raw = unwrapResource<Record<string, unknown>>(data);
      return mapInstitutionalFromApi(raw);
    },

    async updateInstitutionalContent(
      input: IUpdateInstitutionalContentInput,
    ): Promise<IInstitutionalContent> {
      const list: IInstitutionalContent[] = await listInstitutionalSorted(http);

      if (list.length === 0) {
        throw new Error(
          "Nenhum conteúdo institucional na listagem. Recarregue a página ou cadastre o registro.",
        );
      }

      let patchId: number;
      if (list.some((c) => c.id === input.id)) {
        patchId = input.id;
      } else if (list.length === 1) {
        patchId = list[0]!.id;
      } else {
        throw new Error(
          "O id informado não consta na listagem institucional e existem vários registros. Recarregue a página ou corrija os dados no servidor.",
        );
      }

      const body: Record<string, unknown> = {};
      if (input.aboutTitle !== undefined) {
        body.aboutTitle = input.aboutTitle;
      }
      if (input.aboutText !== undefined) {
        body.aboutText = input.aboutText;
      }
      if (input.whoWeAreTitle !== undefined) {
        body.whoWeAreTitle = input.whoWeAreTitle;
      }
      if (input.whoWeAreText !== undefined) {
        body.whoWeAreText = input.whoWeAreText;
      }
      if (input.purposeTitle !== undefined) {
        body.purposeTitle = input.purposeTitle;
      }
      if (input.purposeText !== undefined) {
        body.purposeText = input.purposeText;
      }
      if (input.mission !== undefined) {
        body.mission = input.mission;
      }
      if (input.vision !== undefined) {
        body.vision = input.vision;
      }
      if (input.values !== undefined) {
        body.valuesJson = JSON.stringify(input.values);
      }

      const { data } = await http.patch<unknown>(
        `/admin/institutional-content/${patchId}`,
        body,
      );
      const raw = unwrapResource<Record<string, unknown>>(data);
      return mapInstitutionalFromApi(raw);
    },

    async listSocialLinks(): Promise<ISocialLink[]> {
      const { data } = await http.get<unknown>("/admin/social-links");
      const { items } = unwrapCollection<Record<string, unknown>>(data);
      return items.map((row) =>
        mapSocialLinkFromApi(row as Record<string, unknown>),
      );
    },

    async createSocialLink(
      input: ICreateSocialLinkInput,
    ): Promise<ISocialLink> {
      const { data } = await http.post<unknown>("/admin/social-links", input);
      return mapSocialLinkFromApi(
        unwrapResource<Record<string, unknown>>(data),
      );
    },

    async updateSocialLink(
      input: IUpdateSocialLinkInput,
    ): Promise<ISocialLink> {
      const { id, ...rest } = input;
      const { data } = await http.patch<unknown>(
        `/admin/social-links/${id}`,
        rest,
      );
      return mapSocialLinkFromApi(
        unwrapResource<Record<string, unknown>>(data),
      );
    },

    async deleteSocialLink(id: number): Promise<void> {
      await http.delete(`/admin/social-links/${id}`);
    },

    async listCities(): Promise<ICity[]> {
      const { data } = await http.get<unknown>("/admin/cities");
      const { items } = unwrapCollection<Record<string, unknown>>(data);
      return items.map((row) => mapCityFromApi(row as Record<string, unknown>));
    },

    async getCityById(id: number): Promise<ICity | null> {
      try {
        const { data } = await http.get<unknown>(`/admin/cities/${id}`);
        return mapCityFromApi(unwrapResource<Record<string, unknown>>(data));
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) {
          return null;
        }
        throw toApiError(error);
      }
    },

    async getCityBySlug(slug: string): Promise<ICity | null> {
      try {
        const { data } = await http.get<unknown>(
          `/public/cities/${encodeURIComponent(slug)}`,
        );
        return mapCityFromApi(unwrapResource<Record<string, unknown>>(data));
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) {
          return null;
        }
        throw toApiError(error);
      }
    },

    async createCity(input: ICreateCityInput): Promise<ICity> {
      const image = await resolveWebImagePayloadFromImageUrlField(
        input.imageUrl,
        "Imagem da cidade",
      );
      const { data } = await http.post<unknown>("/admin/cities", {
        name: input.name,
        slug: input.slug,
        state: input.state,
        summary: input.summary,
        description: input.description ?? "",
        published: input.published,
        image,
      });
      return mapCityFromApi(unwrapResource<Record<string, unknown>>(data));
    },

    async updateCity(input: IUpdateCityInput): Promise<ICity> {
      const body: Record<string, unknown> = {};
      if (input.name !== undefined) {
        body.name = input.name;
      }
      if (input.slug !== undefined) {
        body.slug = input.slug;
      }
      if (input.state !== undefined) {
        body.state = input.state;
      }
      if (input.summary !== undefined) {
        body.summary = input.summary;
      }
      if (input.description !== undefined) {
        body.description = input.description;
      }
      if (input.published !== undefined) {
        body.published = input.published;
      }
      if (input.imageUrl !== undefined && input.imageUrl.trim() !== "") {
        body.image = await resolveWebImagePayloadFromImageUrlField(
          input.imageUrl,
          "Imagem da cidade",
        );
      }

      const { data } = await http.patch<unknown>(
        `/admin/cities/${input.id}`,
        body,
      );
      return mapCityFromApi(unwrapResource<Record<string, unknown>>(data));
    },

    async deleteCity(id: number): Promise<void> {
      await http.delete(`/admin/cities/${id}`);
    },

    async listEvents(): Promise<IEvent[]> {
      const { data } = await http.get<unknown>("/admin/events", {
        params: { page: 1, limit: 100, sortDir: "asc" },
      });
      const { items } = unwrapCollection<Record<string, unknown>>(data);
      return items.map((row) =>
        mapEventFromApi(row as Record<string, unknown>),
      );
    },

    async listEventsForPick(query?: IAdminListPickQuery): Promise<IEvent[]> {
      const { data } = await http.get<unknown>("/admin/events", {
        params: buildAdminListPickParams(query),
      });
      const { items } = unwrapCollection<Record<string, unknown>>(data);
      return items.map((row) =>
        mapEventFromApi(row as Record<string, unknown>),
      );
    },

    async getEventById(id: number): Promise<IEvent | null> {
      try {
        const { data } = await http.get<unknown>(`/admin/events/${id}`);
        return mapEventFromApi(unwrapResource<Record<string, unknown>>(data));
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) {
          return null;
        }
        throw toApiError(error);
      }
    },

    async createEvent(input: ICreateEventInput): Promise<IEvent> {
      const image = await resolveWebImagePayloadFromImageUrlField(
        input.imageUrl,
        "Imagem do evento",
      );
      const { data } = await http.post<unknown>("/admin/events", {
        cityId: input.cityId,
        citySlug: input.citySlug,
        name: input.name,
        description: input.description,
        category: input.category,
        startDate: input.startDate,
        endDate: input.endDate,
        formattedDate: input.formattedDate,
        location: input.location,
        featured: input.featured,
        published: input.published,
        image,
      });
      return mapEventFromApi(unwrapResource<Record<string, unknown>>(data));
    },

    async updateEvent(input: IUpdateEventInput): Promise<IEvent> {
      const { id, ...rest } = input;
      const body: Record<string, unknown> = { ...rest };
      if (rest.imageUrl !== undefined && rest.imageUrl.trim() !== "") {
        body.image = await resolveWebImagePayloadFromImageUrlField(
          rest.imageUrl,
          "Imagem do evento",
        );
        delete body.imageUrl;
      }
      const { data } = await http.patch<unknown>(`/admin/events/${id}`, body);
      return mapEventFromApi(unwrapResource<Record<string, unknown>>(data));
    },

    async deleteEvent(id: number): Promise<void> {
      await http.delete(`/admin/events/${id}`);
    },

    async listTouristPoints(): Promise<ITouristPoint[]> {
      const all: ITouristPoint[] = [];
      for (let page = 1; page <= 20; page += 1) {
        const { data } = await http.get<unknown>("/admin/tourist-points", {
          params: { page, limit: 50, sortDir: "asc" },
        });
        const parsed = unwrapCollection<Record<string, unknown>>(data);
        const batch = parsed.items.map((row) =>
          mapTouristPointFromApi(row as Record<string, unknown>),
        );
        all.push(...batch);
        if (page >= parsed.totalPages || batch.length === 0) {
          break;
        }
      }
      return all;
    },

    async listTouristPointsForPick(
      query?: IAdminListPickQuery,
    ): Promise<ITouristPoint[]> {
      const { data } = await http.get<unknown>("/admin/tourist-points", {
        params: buildAdminListPickParams(query),
      });
      const { items } = unwrapCollection<Record<string, unknown>>(data);
      return items.map((row) =>
        mapTouristPointFromApi(row as Record<string, unknown>),
      );
    },

    async getTouristPointById(id: number): Promise<ITouristPoint | null> {
      try {
        const { data } = await http.get<unknown>(`/admin/tourist-points/${id}`);
        return mapTouristPointFromApi(
          unwrapResource<Record<string, unknown>>(data),
        );
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) {
          return null;
        }
        throw toApiError(error);
      }
    },

    async createTouristPoint(
      input: ICreateTouristPointInput,
    ): Promise<ITouristPoint> {
      const image = await resolveWebImagePayloadFromImageUrlField(
        input.imageUrl,
        "Imagem do ponto turístico",
      );
      const { data } = await http.post<unknown>("/admin/tourist-points", {
        cityId: input.cityId,
        citySlug: input.citySlug,
        name: input.name,
        description: input.description,
        category: input.category,
        address: input.address,
        openingHours: input.openingHours,
        featured: input.featured,
        published: input.published,
        image,
      });
      return mapTouristPointFromApi(
        unwrapResource<Record<string, unknown>>(data),
      );
    },

    async updateTouristPoint(
      input: IUpdateTouristPointInput,
    ): Promise<ITouristPoint> {
      const { id, ...rest } = input;
      const body: Record<string, unknown> = { ...rest };
      if (rest.imageUrl !== undefined && rest.imageUrl.trim() !== "") {
        body.image = await resolveWebImagePayloadFromImageUrlField(
          rest.imageUrl,
          "Imagem do ponto turístico",
        );
        delete body.imageUrl;
      }
      const { data } = await http.put<unknown>(
        `/admin/tourist-points/${id}`,
        body,
      );
      return mapTouristPointFromApi(
        unwrapResource<Record<string, unknown>>(data),
      );
    },

    async deleteTouristPoint(id: number): Promise<void> {
      await http.delete(`/admin/tourist-points/${id}`);
    },

    async listHomeBanners(): Promise<IHomeBanner[]> {
      const { data } = await http.get<unknown>("/admin/home-banners");
      const { items } = unwrapCollection<Record<string, unknown>>(data);
      return items.map((row) =>
        mapHomeBannerFromApi(row as Record<string, unknown>),
      );
    },

    async createHomeBanner(
      input: ICreateHomeBannerInput,
    ): Promise<IHomeBanner> {
      const image = await resolveWebImagePayloadFromImageUrlField(
        input.imageUrl,
        "Imagem do banner",
      );
      const subtitle =
        input.subtitle && input.subtitle.length >= 3
          ? input.subtitle
          : "Subtítulo";
      const { data } = await http.post<unknown>("/admin/home-banners", {
        title: input.title,
        subtitle,
        image,
        ctaLabel: input.ctaLabel ?? "Saiba mais",
        ctaUrl: input.ctaUrl ?? "https://example.com",
        active: input.active,
        order: input.order,
      });
      return mapHomeBannerFromApi(
        unwrapResource<Record<string, unknown>>(data),
      );
    },

    async updateHomeBanner(
      input: IUpdateHomeBannerInput,
    ): Promise<IHomeBanner> {
      const { id, ...rest } = input;
      const body: Record<string, unknown> = { ...rest };
      if (rest.imageUrl !== undefined && rest.imageUrl.trim() !== "") {
        body.image = await resolveWebImagePayloadFromImageUrlField(
          rest.imageUrl,
          "Imagem do banner",
        );
        delete body.imageUrl;
      }
      const { data } = await http.patch<unknown>(
        `/admin/home-banners/${id}`,
        body,
      );
      return mapHomeBannerFromApi(
        unwrapResource<Record<string, unknown>>(data),
      );
    },

    async deleteHomeBanner(id: number): Promise<void> {
      await http.delete(`/admin/home-banners/${id}`);
    },

    async listHomeHighlights(): Promise<IHomeHighlight[]> {
      const { data } = await http.get<unknown>("/admin/home-highlights");
      const { items } = unwrapCollection<Record<string, unknown>>(data);
      return items.map((row) =>
        mapHomeHighlightFromApi(row as Record<string, unknown>),
      );
    },

    async createHomeHighlight(
      input: ICreateHomeHighlightInput,
    ): Promise<IHomeHighlight> {
      const ref =
        input.referenceId !== undefined ? Number(input.referenceId) : NaN;
      if (!Number.isFinite(ref)) {
        throw new Error(
          "referenceId numérico é obrigatório para criar destaque.",
        );
      }
      const image = await resolveWebImagePayloadFromImageUrlField(
        input.imageUrl,
        "Imagem do destaque",
      );
      const { data } = await http.post<unknown>("/admin/home-highlights", {
        type: input.type,
        referenceId: ref,
        title: input.title,
        description: input.description,
        cityName:
          input.cityName && input.cityName.length >= 3
            ? input.cityName
            : "Cidade",
        image,
        ctaUrl: input.ctaUrl ?? "https://example.com",
        active: input.active,
        order: input.order,
      });
      return mapHomeHighlightFromApi(
        unwrapResource<Record<string, unknown>>(data),
      );
    },

    async updateHomeHighlight(
      input: IUpdateHomeHighlightInput,
    ): Promise<IHomeHighlight> {
      const { id, ...rest } = input;
      const body: Record<string, unknown> = { ...rest };
      if (rest.referenceId !== undefined) {
        body.referenceId = Number(rest.referenceId);
      }
      if (rest.imageUrl !== undefined && rest.imageUrl.trim() !== "") {
        body.image = await resolveWebImagePayloadFromImageUrlField(
          rest.imageUrl,
          "Imagem do destaque",
        );
        delete body.imageUrl;
      }
      const { data } = await http.patch<unknown>(
        `/admin/home-highlights/${id}`,
        body,
      );
      return mapHomeHighlightFromApi(
        unwrapResource<Record<string, unknown>>(data),
      );
    },

    async deleteHomeHighlight(id: number): Promise<void> {
      await http.delete(`/admin/home-highlights/${id}`);
    },
  };
}
