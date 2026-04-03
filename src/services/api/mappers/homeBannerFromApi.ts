import type { IHomeBanner } from "@/entities/home-content/homeContent.types";

export function mapHomeBannerFromApi(
  raw: Record<string, unknown>,
): IHomeBanner {
  return {
    id: Number(raw.id),
    title: String(raw.title ?? ""),
    subtitle: raw.subtitle !== undefined ? String(raw.subtitle) : undefined,
    imageUrl: String(raw.imageUrl ?? ""),
    ctaLabel: raw.ctaLabel !== undefined ? String(raw.ctaLabel) : undefined,
    ctaUrl: raw.ctaUrl !== undefined ? String(raw.ctaUrl) : undefined,
    active: Boolean(raw.active),
    order: Number(raw.order ?? 0),
  };
}
