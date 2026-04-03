import type { IEvent } from "@/entities/event/event.types";
import { toIsoDate } from "./toIsoDate";

export function mapEventFromApi(raw: Record<string, unknown>): IEvent {
  return {
    id: Number(raw.id),
    cityId: Number(raw.cityId),
    citySlug: String(raw.citySlug ?? ""),
    name: String(raw.name ?? ""),
    description: String(raw.description ?? ""),
    category: raw.category !== undefined ? String(raw.category) : undefined,
    startDate:
      raw.startDate !== undefined ? toIsoDate(raw.startDate, "") : undefined,
    endDate: raw.endDate !== undefined ? toIsoDate(raw.endDate, "") : undefined,
    formattedDate:
      raw.formattedDate !== undefined ? String(raw.formattedDate) : undefined,
    location: raw.location !== undefined ? String(raw.location) : undefined,
    imageUrl: raw.imageUrl !== undefined ? String(raw.imageUrl) : undefined,
    featured: Boolean(raw.featured),
    published: Boolean(raw.published),
    createdAt: toIsoDate(raw.createdAt, new Date(0).toISOString()),
    updatedAt: toIsoDate(raw.updatedAt, new Date(0).toISOString()),
  };
}
