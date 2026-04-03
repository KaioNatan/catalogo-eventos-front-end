import type { ICity } from "@/entities/city/city.types";
import type { IEvent } from "@/entities/event/event.types";
import type { ITouristPoint } from "@/entities/tourist-point/touristPoint.types";
import type { IInstitutionalContent } from "@/entities/institutional/institutional.types";
import type { ISocialLink } from "@/entities/social-link/socialLink.types";
import type {
  IHomeBanner,
  IHomeHighlight,
} from "@/entities/home-content/homeContent.types";

export interface IPublicListParams {
  /** Filtro por slug da cidade (in-memory e BFF com `city` em pontos turísticos). */
  citySlug?: string;
  /** Filtro nativo da API de eventos (`cityId`). */
  cityId?: number;
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
  /** Cancelamento ao trocar filtros / desmontar (catálogo público). */
  signal?: AbortSignal;
}

export interface IPublicListResponse<TItem> {
  items: TItem[];
  total: number;
  page: number;
  limit: number;
}

export interface IPublicHomeHighlightsResponse {
  events: IEvent[];
  touristPoints: ITouristPoint[];
}

export interface IPublicHomeContentResponse {
  banners: IHomeBanner[];
  highlights: IHomeHighlight[];
}

export interface IPublicApiClient {
  listPublishedCities: () => Promise<ICity[]>;
  getPublishedCityBySlug: (slug: string) => Promise<ICity | null>;

  listPublishedEvents: (
    params: IPublicListParams,
  ) => Promise<IPublicListResponse<IEvent>>;
  getPublishedEventById: (id: number) => Promise<IEvent | null>;
  listPublishedEventByCityId(cityId: number): Promise<IEvent[] | null>;

  listPublishedTouristPoints: (
    params: IPublicListParams,
  ) => Promise<IPublicListResponse<ITouristPoint>>;
  getPublishedTouristPointById: (id: number) => Promise<ITouristPoint | null>;
  listPublishedTouristPointByCityId(
    cityId: number,
  ): Promise<ITouristPoint[] | null>;

  getInstitutionalContent: () => Promise<IInstitutionalContent>;
  listActiveSocialLinks: () => Promise<ISocialLink[]>;
  getHomeHighlights: () => Promise<IPublicHomeHighlightsResponse>;
  getHomeContent: () => Promise<IPublicHomeContentResponse>;
}
