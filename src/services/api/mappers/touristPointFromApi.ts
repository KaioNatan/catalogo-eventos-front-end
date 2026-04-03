import type { ITouristPoint } from "@/entities/tourist-point/touristPoint.types";
import { toIsoDate } from "./toIsoDate";

export function mapTouristPointFromApi(
  raw: Record<string, unknown>,
): ITouristPoint {
  return {
    id: Number(raw.id),
    cityId: Number(raw.cityId),
    citySlug: String(raw.citySlug ?? ""),
    name: String(raw.name ?? ""),
    description: String(raw.description ?? ""),
    category: raw.category !== undefined ? String(raw.category) : undefined,
    address: raw.address !== undefined ? String(raw.address) : undefined,
    openingHours:
      raw.openingHours !== undefined ? String(raw.openingHours) : undefined,
    imageUrl: raw.imageUrl !== undefined ? String(raw.imageUrl) : undefined,
    featured: Boolean(raw.featured),
    published: Boolean(raw.published),
    createdAt: toIsoDate(raw.createdAt, new Date(0).toISOString()),
    updatedAt: toIsoDate(raw.updatedAt, new Date(0).toISOString()),
  };
}
