import type { ISocialLink } from "@/entities/social-link/socialLink.types";

export function mapSocialLinkFromApi(
  raw: Record<string, unknown>,
): ISocialLink {
  return {
    id: Number(raw.id),
    platform: raw.platform as ISocialLink["platform"],
    label: String(raw.label ?? ""),
    url: String(raw.url ?? ""),
    active: Boolean(raw.active),
    order: Number(raw.order ?? 0),
  };
}
