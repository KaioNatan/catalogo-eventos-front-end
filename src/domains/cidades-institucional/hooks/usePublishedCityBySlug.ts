import { useEffect, useState } from "react";
import type { ICity } from "@/entities/city/city.types";
import { toApiError } from "@/services/api/apiError";
import { loadPublishedCityBySlug } from "@/services/public-api/publicCities.api";

export interface IUsePublishedCityBySlugResult {
  city: ICity | null;
  isLoading: boolean;
  notFound: boolean;
  error: string | null;
}

export function usePublishedCityBySlug(
  slug: string | undefined,
): IUsePublishedCityBySlugResult {
  const [city, setCity] = useState<ICity | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(slug));
  const [notFound, setNotFound] = useState<boolean>(!slug);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive: boolean = true;

    async function loadCity(): Promise<void> {
      if (!slug) {
        setCity(null);
        setError(null);
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        setNotFound(false);
        setCity(null);

        const response: ICity | null = await loadPublishedCityBySlug(slug);

        if (!isActive) {
          return;
        }

        if (!response || !response.published) {
          setNotFound(true);
          return;
        }

        setCity(response);
      } catch (caught) {
        if (!isActive) {
          return;
        }
        setError(toApiError(caught).message);
        setNotFound(false);
        setCity(null);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadCity();

    return () => {
      isActive = false;
    };
  }, [slug]);

  return { city, isLoading, notFound, error };
}
