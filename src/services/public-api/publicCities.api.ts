import type { ICity } from "@/entities/city/city.types";
import { publicApiClient } from "@/services/public-api/client";

/**
 * Lista cidades publicadas (delega ao cliente HTTP).
 * Catálogo e hooks devem preferir esta função ao singleton `publicApiClient`.
 */
export function loadPublishedCitiesCatalog(): Promise<ICity[]> {
  return publicApiClient.listPublishedCities();
}

/**
 * Ficha pública da cidade por slug (404 / não publicada → `null`).
 */
export function loadPublishedCityBySlug(slug: string): Promise<ICity | null> {
  return publicApiClient.getPublishedCityBySlug(slug);
}
