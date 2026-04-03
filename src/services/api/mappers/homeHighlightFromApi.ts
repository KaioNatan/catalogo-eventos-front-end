import type { IHomeHighlight } from "@/entities/home-content/homeContent.types";

export function mapHomeHighlightFromApi(
  raw: Record<string, unknown>,
): IHomeHighlight {
  const ref = raw.referenceId;
  return {
    id: Number(raw.id),
    type: raw.type as IHomeHighlight["type"],
    referenceId: ref !== undefined && ref !== null ? String(ref) : undefined,
    title: String(raw.title ?? ""),
    description: String(raw.description ?? ""),
    cityName: raw.cityName !== undefined ? String(raw.cityName) : undefined,
    imageUrl: raw.imageUrl !== undefined ? String(raw.imageUrl) : undefined,
    ctaUrl: raw.ctaUrl !== undefined ? String(raw.ctaUrl) : undefined,
    active: Boolean(raw.active),
    order: Number(raw.order ?? 0),
  };
}
