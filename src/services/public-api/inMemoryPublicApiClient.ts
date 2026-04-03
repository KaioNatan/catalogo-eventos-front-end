import type { ICity } from "@/entities/city/city.types";
import type { IEvent } from "@/entities/event/event.types";
import type { IInstitutionalContent } from "@/entities/institutional/institutional.types";
import type { ISocialLink } from "@/entities/social-link/socialLink.types";
import type { ITouristPoint } from "@/entities/tourist-point/touristPoint.types";
import type {
  IHomeBanner,
  IHomeHighlight,
} from "@/entities/home-content/homeContent.types";
import {
  getCitiesMock,
  getEventsMock,
  getHomeBannersMock,
  getHomeHighlightsMock,
  getInstitutionalContentMock,
  getSocialLinksMock,
  getTouristPointsMock,
} from "@/services/in-memory/mock-data";
import type {
  IPublicApiClient,
  IPublicHomeContentResponse,
  IPublicHomeHighlightsResponse,
  IPublicListParams,
  IPublicListResponse,
} from "./publicApi.types";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function matchesSearch(
  source: string | undefined,
  search: string | undefined,
): boolean {
  if (!search) {
    return true;
  }

  if (!source) {
    return false;
  }

  return normalizeText(source).includes(normalizeText(search));
}

function paginateItems<TItem>(
  items: TItem[],
  page: number = DEFAULT_PAGE,
  limit: number = DEFAULT_LIMIT,
): IPublicListResponse<TItem> {
  const safePage: number = page > 0 ? page : DEFAULT_PAGE;
  const safeLimit: number = limit > 0 ? limit : DEFAULT_LIMIT;

  const startIndex: number = (safePage - 1) * safeLimit;
  const endIndex: number = startIndex + safeLimit;

  return {
    items: items.slice(startIndex, endIndex),
    total: items.length,
    page: safePage,
    limit: safeLimit,
  };
}

/**
 * Cliente público que lê apenas o store em memória compartilhado (`in-memory/mock-data`).
 * Não importa o cliente admin: a fronteira público/CMS fica no store, até existir BFF HTTP.
 */
export function createInMemoryPublicApiClient(): IPublicApiClient {
  return {
    async listPublishedCities(): Promise<ICity[]> {
      const cities: ICity[] = getCitiesMock();
      return cities.filter((item: ICity) => item.published);
    },

    async getPublishedCityBySlug(slug: string): Promise<ICity | null> {
      const city: ICity | undefined = getCitiesMock().find(
        (item: ICity) => item.slug === slug,
      );

      if (!city || !city.published) {
        return null;
      }

      return city;
    },

    async listPublishedEvents(
      params: IPublicListParams,
    ): Promise<IPublicListResponse<IEvent>> {
      const events: IEvent[] = getEventsMock();

      const filteredItems: IEvent[] = events.filter((item: IEvent) => {
        const matchesPublished: boolean = item.published;
        const matchesCity: boolean =
          (params.cityId === undefined || item.cityId === params.cityId) &&
          (!params.citySlug || item.citySlug === params.citySlug);
        const matchesCategory: boolean =
          !params.category || item.category === params.category;
        const matchesText: boolean =
          matchesSearch(item.name, params.search) ||
          matchesSearch(item.description, params.search);

        return (
          matchesPublished && matchesCity && matchesCategory && matchesText
        );
      });

      return paginateItems(filteredItems, params.page, params.limit);
    },

    async getPublishedEventById(id: number): Promise<IEvent | null> {
      const event: IEvent | undefined = getEventsMock().find(
        (item: IEvent) => item.id === id,
      );

      if (!event || !event.published) {
        return null;
      }

      return event;
    },

    async listPublishedEventByCityId(cityId: number): Promise<IEvent[] | null> {
      const events: IEvent[] = getEventsMock();
      return events.filter(
        (item: IEvent) => item.published && item.cityId === cityId,
      );
    },

    async listPublishedTouristPoints(
      params: IPublicListParams,
    ): Promise<IPublicListResponse<ITouristPoint>> {
      const touristPoints: ITouristPoint[] = getTouristPointsMock();

      const filteredItems: ITouristPoint[] = touristPoints.filter(
        (item: ITouristPoint) => {
          const matchesPublished: boolean = item.published;
          const matchesCity: boolean =
            (params.cityId === undefined || item.cityId === params.cityId) &&
            (!params.citySlug || item.citySlug === params.citySlug);
          const matchesCategory: boolean =
            !params.category || item.category === params.category;
          const matchesText: boolean =
            matchesSearch(item.name, params.search) ||
            matchesSearch(item.description, params.search);

          return (
            matchesPublished && matchesCity && matchesCategory && matchesText
          );
        },
      );

      return paginateItems(filteredItems, params.page, params.limit);
    },

    async getPublishedTouristPointById(
      id: number,
    ): Promise<ITouristPoint | null> {
      const touristPoint: ITouristPoint | undefined =
        getTouristPointsMock().find((item: ITouristPoint) => item.id === id);

      if (!touristPoint || !touristPoint.published) {
        return null;
      }

      return touristPoint;
    },

    async listPublishedTouristPointByCityId(
      cityId: number,
    ): Promise<ITouristPoint[] | null> {
      const touristPoints: ITouristPoint[] = getTouristPointsMock();
      return touristPoints.filter(
        (item: ITouristPoint) => item.published && item.cityId === cityId,
      );
    },

    async getInstitutionalContent(): Promise<IInstitutionalContent> {
      return getInstitutionalContentMock();
    },

    async listActiveSocialLinks(): Promise<ISocialLink[]> {
      const items: ISocialLink[] = getSocialLinksMock();
      return items.filter((item: ISocialLink) => item.active);
    },

    async getHomeHighlights(): Promise<IPublicHomeHighlightsResponse> {
      const events: IEvent[] = getEventsMock();
      const touristPoints: ITouristPoint[] = getTouristPointsMock();

      return {
        events: events.filter(
          (item: IEvent) => item.published && item.featured,
        ),
        touristPoints: touristPoints.filter(
          (item: ITouristPoint) => item.published && item.featured,
        ),
      };
    },

    async getHomeContent(): Promise<IPublicHomeContentResponse> {
      const banners: IHomeBanner[] = getHomeBannersMock();
      const highlights: IHomeHighlight[] = getHomeHighlightsMock();

      return {
        banners: banners.filter((item: IHomeBanner) => item.active),
        highlights: highlights.filter((item: IHomeHighlight) => item.active),
      };
    },
  };
}
