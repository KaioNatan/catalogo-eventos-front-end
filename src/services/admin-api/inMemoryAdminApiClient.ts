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
import type { IAdminApiClient, IAdminListPickQuery } from "./adminApi.types";
import {
  adminMockDelay,
  getInstitutionalContentMock,
  isInstitutionalRecordPresent,
  getSocialLinksMock,
  setInstitutionalContentMock,
  setInstitutionalRecordPresent,
  setSocialLinksMock,
  getCitiesMock,
  setCitiesMock,
  getEventsMock,
  setEventsMock,
  setTouristPointsMock,
  getTouristPointsMock,
  getHomeBannersMock,
  getHomeHighlightsMock,
  setHomeBannersMock,
  setHomeHighlightsMock,
} from "@/services/in-memory/mock-data";

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

function filterEventsForPick(
  items: IEvent[],
  query?: IAdminListPickQuery,
): IEvent[] {
  let out: IEvent[] = [...items];
  if (query?.search?.trim()) {
    const s: string = query.search.trim().toLowerCase();
    out = out.filter((e: IEvent) => e.name.toLowerCase().includes(s));
  }
  if (query?.category?.trim()) {
    const c: string = query.category.trim().toLowerCase();
    out = out.filter((e: IEvent) =>
      (e.category ?? "").toLowerCase().includes(c),
    );
  }
  const limit: number = query?.limit ?? 30;
  const page: number = query?.page ?? 1;
  const start: number = (page - 1) * limit;
  return out.slice(start, start + limit);
}

function filterTouristPointsForPick(
  items: ITouristPoint[],
  query?: IAdminListPickQuery,
): ITouristPoint[] {
  let out: ITouristPoint[] = [...items];
  if (query?.search?.trim()) {
    const s: string = query.search.trim().toLowerCase();
    out = out.filter((p: ITouristPoint) => p.name.toLowerCase().includes(s));
  }
  if (query?.category?.trim()) {
    const c: string = query.category.trim().toLowerCase();
    out = out.filter((p: ITouristPoint) =>
      (p.category ?? "").toLowerCase().includes(c),
    );
  }
  const limit: number = query?.limit ?? 30;
  const page: number = query?.page ?? 1;
  const start: number = (page - 1) * limit;
  return out.slice(start, start + limit);
}

export function createInMemoryAdminApiClient(): IAdminApiClient {
  return {
    async getInstitutionalContent(): Promise<IInstitutionalContent | null> {
      await adminMockDelay();
      if (!isInstitutionalRecordPresent()) {
        return null;
      }
      return getInstitutionalContentMock();
    },

    async createInstitutionalContent(
      input: ICreateInstitutionalContentInput,
    ): Promise<IInstitutionalContent> {
      await adminMockDelay();

      const nextValue: IInstitutionalContent = {
        id: 1,
        updatedAt: new Date().toISOString(),
        ...input,
      };

      setInstitutionalContentMock(nextValue);
      setInstitutionalRecordPresent(true);

      return nextValue;
    },

    async updateInstitutionalContent(
      input: IUpdateInstitutionalContentInput,
    ): Promise<IInstitutionalContent> {
      await adminMockDelay();

      if (!isInstitutionalRecordPresent()) {
        throw new Error(
          "Nenhum conteúdo institucional na listagem. Recarregue a página ou cadastre o registro.",
        );
      }

      const listed: IInstitutionalContent = getInstitutionalContentMock();
      const patchId: number = listed.id === input.id ? input.id : listed.id;

      const nextValue: IInstitutionalContent = {
        ...listed,
        ...input,
        id: patchId,
        updatedAt: new Date().toISOString(),
      };

      setInstitutionalContentMock(nextValue);

      return nextValue;
    },

    async listSocialLinks(): Promise<ISocialLink[]> {
      await adminMockDelay();
      return getSocialLinksMock();
    },

    async createSocialLink(
      input: ICreateSocialLinkInput,
    ): Promise<ISocialLink> {
      await adminMockDelay();

      const currentItems: ISocialLink[] = getSocialLinksMock();

      const nextItem: ISocialLink = {
        id: Math.random(),
        ...input,
      };

      setSocialLinksMock([...currentItems, nextItem]);

      return nextItem;
    },

    async updateSocialLink(
      input: IUpdateSocialLinkInput,
    ): Promise<ISocialLink> {
      await adminMockDelay();

      const currentItems: ISocialLink[] = getSocialLinksMock();
      const currentItem: ISocialLink | undefined = currentItems.find(
        (item: ISocialLink) => item.id === input.id,
      );

      if (!currentItem) {
        throw new Error("Link social não encontrado.");
      }

      const nextItem: ISocialLink = {
        ...currentItem,
        ...input,
      };

      const nextItems: ISocialLink[] = currentItems.map((item: ISocialLink) =>
        item.id === input.id ? nextItem : item,
      );

      setSocialLinksMock(nextItems);

      return nextItem;
    },

    async deleteSocialLink(id: number): Promise<void> {
      await adminMockDelay();

      const currentItems: ISocialLink[] = getSocialLinksMock();
      const nextItems: ISocialLink[] = currentItems.filter(
        (item: ISocialLink) => item.id !== id,
      );

      setSocialLinksMock(nextItems);
    },

    async listCities(): Promise<ICity[]> {
      await adminMockDelay();
      return getCitiesMock();
    },

    async getCityById(id: number): Promise<ICity | null> {
      await adminMockDelay();

      const currentItems: ICity[] = getCitiesMock();
      const foundItem: ICity | undefined = currentItems.find(
        (item: ICity) => item.id === id,
      );

      return foundItem ?? null;
    },

    async getCityBySlug(slug: string): Promise<ICity | null> {
      await adminMockDelay();

      const currentItems: ICity[] = getCitiesMock();
      const foundItem: ICity | undefined = currentItems.find(
        (item: ICity) => item.slug === slug,
      );

      return foundItem ?? null;
    },

    async createCity(input: ICreateCityInput): Promise<ICity> {
      await adminMockDelay();

      const currentItems: ICity[] = getCitiesMock();

      const nextItem: ICity = {
        id: Math.random(),
        ...input,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setCitiesMock([...currentItems, nextItem]);

      return nextItem;
    },

    async updateCity(input: IUpdateCityInput): Promise<ICity> {
      await adminMockDelay();

      const currentItems: ICity[] = getCitiesMock();
      const currentItem: ICity | undefined = currentItems.find(
        (item: ICity) => item.id === input.id,
      );

      if (!currentItem) {
        throw new Error("Cidade não encontrada.");
      }

      const nextItem: ICity = {
        ...currentItem,
        ...input,
        updatedAt: new Date().toISOString(),
      };

      const nextItems: ICity[] = currentItems.map((item: ICity) =>
        item.id === input.id ? nextItem : item,
      );

      setCitiesMock(nextItems);

      return nextItem;
    },

    async deleteCity(id: number): Promise<void> {
      await adminMockDelay();

      const currentItems: ICity[] = getCitiesMock();
      const nextItems: ICity[] = currentItems.filter(
        (item: ICity) => item.id !== id,
      );

      setCitiesMock(nextItems);
    },

    async listEvents(): Promise<IEvent[]> {
      await adminMockDelay();
      return getEventsMock();
    },

    async listEventsForPick(query?: IAdminListPickQuery): Promise<IEvent[]> {
      await adminMockDelay();
      return filterEventsForPick(getEventsMock(), query);
    },

    async getEventById(id: number): Promise<IEvent | null> {
      await adminMockDelay();

      const currentItems: IEvent[] = getEventsMock();
      const foundItem: IEvent | undefined = currentItems.find(
        (item: IEvent) => item.id === id,
      );

      return foundItem ?? null;
    },

    async createEvent(input: ICreateEventInput): Promise<IEvent> {
      await adminMockDelay();

      const currentItems: IEvent[] = getEventsMock();

      const nextItem: IEvent = {
        id: Math.random(),
        ...input,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setEventsMock([...currentItems, nextItem]);

      return nextItem;
    },

    async updateEvent(input: IUpdateEventInput): Promise<IEvent> {
      await adminMockDelay();

      const currentItems: IEvent[] = getEventsMock();
      const currentItem: IEvent | undefined = currentItems.find(
        (item: IEvent) => item.id === input.id,
      );

      if (!currentItem) {
        throw new Error("Evento não encontrado.");
      }

      const nextItem: IEvent = {
        ...currentItem,
        ...input,
        updatedAt: new Date().toISOString(),
      };

      const nextItems: IEvent[] = currentItems.map((item: IEvent) =>
        item.id === input.id ? nextItem : item,
      );

      setEventsMock(nextItems);

      return nextItem;
    },

    async deleteEvent(id: number): Promise<void> {
      await adminMockDelay();

      const currentItems: IEvent[] = getEventsMock();
      const nextItems: IEvent[] = currentItems.filter(
        (item: IEvent) => item.id !== id,
      );

      setEventsMock(nextItems);
    },

    async listTouristPoints(): Promise<ITouristPoint[]> {
      await adminMockDelay();
      return getTouristPointsMock();
    },

    async listTouristPointsForPick(
      query?: IAdminListPickQuery,
    ): Promise<ITouristPoint[]> {
      await adminMockDelay();
      return filterTouristPointsForPick(getTouristPointsMock(), query);
    },

    async getTouristPointById(id: number): Promise<ITouristPoint | null> {
      await adminMockDelay();

      const currentItems: ITouristPoint[] = getTouristPointsMock();
      const foundItem: ITouristPoint | undefined = currentItems.find(
        (item: ITouristPoint) => item.id === id,
      );

      return foundItem ?? null;
    },

    async createTouristPoint(
      input: ICreateTouristPointInput,
    ): Promise<ITouristPoint> {
      await adminMockDelay();

      const currentItems: ITouristPoint[] = getTouristPointsMock();

      const nextItem: ITouristPoint = {
        id: Math.random(),
        ...input,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setTouristPointsMock([...currentItems, nextItem]);

      return nextItem;
    },

    async updateTouristPoint(
      input: IUpdateTouristPointInput,
    ): Promise<ITouristPoint> {
      await adminMockDelay();

      const currentItems: ITouristPoint[] = getTouristPointsMock();
      const currentItem: ITouristPoint | undefined = currentItems.find(
        (item: ITouristPoint) => item.id === input.id,
      );

      if (!currentItem) {
        throw new Error("Ponto turístico não encontrado.");
      }

      const nextItem: ITouristPoint = {
        ...currentItem,
        ...input,
        updatedAt: new Date().toISOString(),
      };

      const nextItems: ITouristPoint[] = currentItems.map(
        (item: ITouristPoint) => (item.id === input.id ? nextItem : item),
      );

      setTouristPointsMock(nextItems);

      return nextItem;
    },

    async deleteTouristPoint(id: number): Promise<void> {
      await adminMockDelay();

      const currentItems: ITouristPoint[] = getTouristPointsMock();
      const nextItems: ITouristPoint[] = currentItems.filter(
        (item: ITouristPoint) => item.id !== id,
      );

      setTouristPointsMock(nextItems);
    },

    async listHomeBanners(): Promise<IHomeBanner[]> {
      await adminMockDelay();
      return getHomeBannersMock();
    },

    async createHomeBanner(
      input: ICreateHomeBannerInput,
    ): Promise<IHomeBanner> {
      await adminMockDelay();

      const currentItems: IHomeBanner[] = getHomeBannersMock();

      const nextItem: IHomeBanner = {
        id: Math.random(),
        ...input,
      };

      setHomeBannersMock([...currentItems, nextItem]);

      return nextItem;
    },

    async updateHomeBanner(
      input: IUpdateHomeBannerInput,
    ): Promise<IHomeBanner> {
      await adminMockDelay();

      const currentItems: IHomeBanner[] = getHomeBannersMock();
      const currentItem: IHomeBanner | undefined = currentItems.find(
        (item: IHomeBanner) => item.id === input.id,
      );

      if (!currentItem) {
        throw new Error("Banner não encontrado.");
      }

      const nextItem: IHomeBanner = {
        ...currentItem,
        ...input,
      };

      setHomeBannersMock(
        currentItems.map((item: IHomeBanner) =>
          item.id === input.id ? nextItem : item,
        ),
      );

      return nextItem;
    },

    async deleteHomeBanner(id: number): Promise<void> {
      await adminMockDelay();

      const currentItems: IHomeBanner[] = getHomeBannersMock();
      setHomeBannersMock(
        currentItems.filter((item: IHomeBanner) => item.id !== id),
      );
    },

    async listHomeHighlights(): Promise<IHomeHighlight[]> {
      await adminMockDelay();
      return getHomeHighlightsMock();
    },

    async createHomeHighlight(
      input: ICreateHomeHighlightInput,
    ): Promise<IHomeHighlight> {
      await adminMockDelay();

      const currentItems: IHomeHighlight[] = getHomeHighlightsMock();

      const nextItem: IHomeHighlight = {
        id: Math.random(),
        ...input,
      };

      setHomeHighlightsMock([...currentItems, nextItem]);

      return nextItem;
    },

    async updateHomeHighlight(
      input: IUpdateHomeHighlightInput,
    ): Promise<IHomeHighlight> {
      await adminMockDelay();

      const currentItems: IHomeHighlight[] = getHomeHighlightsMock();
      const currentItem: IHomeHighlight | undefined = currentItems.find(
        (item: IHomeHighlight) => item.id === input.id,
      );

      if (!currentItem) {
        throw new Error("Destaque não encontrado.");
      }

      const nextItem: IHomeHighlight = {
        ...currentItem,
        ...input,
      };

      setHomeHighlightsMock(
        currentItems.map((item: IHomeHighlight) =>
          item.id === input.id ? nextItem : item,
        ),
      );

      return nextItem;
    },

    async deleteHomeHighlight(id: number): Promise<void> {
      await adminMockDelay();

      const currentItems: IHomeHighlight[] = getHomeHighlightsMock();
      setHomeHighlightsMock(
        currentItems.filter((item: IHomeHighlight) => item.id !== id),
      );
    },
  };
}
