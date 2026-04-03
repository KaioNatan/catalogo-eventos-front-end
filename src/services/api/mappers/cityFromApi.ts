import type { ICity } from "@/entities/city/city.types";
import { toIsoDate } from "./toIsoDate";

export function mapCityFromApi(raw: Record<string, unknown>): ICity {
  return {
    id: Number(raw.id),
    name: String(raw.name ?? ""),
    state: String(raw.state ?? ""),
    slug: String(raw.slug ?? ""),
    summary: String(raw.summary ?? ""),
    description:
      raw.description !== undefined ? String(raw.description) : undefined,
    imageUrl: raw.imageUrl !== undefined ? String(raw.imageUrl) : undefined,
    published: Boolean(raw.published),
    createdAt: toIsoDate(raw.createdAt, new Date(0).toISOString()),
    updatedAt: toIsoDate(raw.updatedAt, new Date(0).toISOString()),
  };
}
