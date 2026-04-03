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

/** Filtros para listagens admin usadas em combobox (nome + categoria na query do BFF). */
export interface IAdminListPickQuery {
  /** Texto parcial do nome; enviado como `name` na query (alinhado ao público). */
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface IAdminApiClient {
  /** `null` quando ainda não existe registro institucional (lista vazia). */
  getInstitutionalContent: () => Promise<IInstitutionalContent | null>;
  createInstitutionalContent: (
    input: ICreateInstitutionalContentInput,
  ) => Promise<IInstitutionalContent>;
  updateInstitutionalContent: (
    input: IUpdateInstitutionalContentInput,
  ) => Promise<IInstitutionalContent>;

  listSocialLinks: () => Promise<ISocialLink[]>;
  createSocialLink: (input: ICreateSocialLinkInput) => Promise<ISocialLink>;
  updateSocialLink: (input: IUpdateSocialLinkInput) => Promise<ISocialLink>;
  deleteSocialLink: (id: number) => Promise<void>;

  listCities: () => Promise<ICity[]>;
  getCityById: (id: number) => Promise<ICity | null>;
  getCityBySlug: (slug: string) => Promise<ICity | null>;
  createCity: (input: ICreateCityInput) => Promise<ICity>;
  updateCity: (input: IUpdateCityInput) => Promise<ICity>;
  deleteCity: (id: number) => Promise<void>;

  listEvents: () => Promise<IEvent[]>;
  /** Lista paginada com filtros para UX de seleção (debounce no formulário). */
  listEventsForPick: (query?: IAdminListPickQuery) => Promise<IEvent[]>;
  getEventById: (id: number) => Promise<IEvent | null>;
  createEvent: (input: ICreateEventInput) => Promise<IEvent>;
  updateEvent: (input: IUpdateEventInput) => Promise<IEvent>;
  deleteEvent: (id: number) => Promise<void>;

  listTouristPoints: () => Promise<ITouristPoint[]>;
  listTouristPointsForPick: (
    query?: IAdminListPickQuery,
  ) => Promise<ITouristPoint[]>;
  getTouristPointById: (id: number) => Promise<ITouristPoint | null>;
  createTouristPoint: (
    input: ICreateTouristPointInput,
  ) => Promise<ITouristPoint>;
  updateTouristPoint: (
    input: IUpdateTouristPointInput,
  ) => Promise<ITouristPoint>;
  deleteTouristPoint: (id: number) => Promise<void>;

  listHomeBanners: () => Promise<IHomeBanner[]>;
  createHomeBanner: (input: ICreateHomeBannerInput) => Promise<IHomeBanner>;
  updateHomeBanner: (input: IUpdateHomeBannerInput) => Promise<IHomeBanner>;
  deleteHomeBanner: (id: number) => Promise<void>;

  listHomeHighlights: () => Promise<IHomeHighlight[]>;
  createHomeHighlight: (
    input: ICreateHomeHighlightInput,
  ) => Promise<IHomeHighlight>;
  updateHomeHighlight: (
    input: IUpdateHomeHighlightInput,
  ) => Promise<IHomeHighlight>;
  deleteHomeHighlight: (id: number) => Promise<void>;
}
