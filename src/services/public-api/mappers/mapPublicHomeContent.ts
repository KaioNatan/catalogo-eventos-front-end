import type { IPublicHomeContentResponse } from "@/services/public-api/publicApi.types";
import { mapHomeBannerFromApi } from "@/services/api/mappers/homeBannerFromApi";
import { mapHomeHighlightFromApi } from "@/services/api/mappers/homeHighlightFromApi";

export function mapPublicHomeContentFromResource(payload: {
  banners: Array<Record<string, unknown>>;
  highlights: Array<Record<string, unknown>>;
}): IPublicHomeContentResponse {
  const banners = (payload.banners ?? [])
    .filter((b) => Boolean(b.active))
    .map((b) => mapHomeBannerFromApi(b))
    .sort((a, b) => a.order - b.order);

  const highlights = (payload.highlights ?? [])
    .filter((h) => Boolean(h.active))
    .map((h) => mapHomeHighlightFromApi(h))
    .sort((a, b) => a.order - b.order);

  return { banners, highlights };
}
