import { useEffect, useState } from "react";
import type { ICity } from "@/entities/city/city.types";
import { getOrCreateSessionPromise } from "@/domains/public-portal/cache/sessionFetchCache";
import { toApiError } from "@/services/api/apiError";
import { loadPublishedCitiesCatalog } from "@/services/public-api/publicCities.api";

interface IUsePublicCitiesResult {
  cities: ICity[];
  isLoading: boolean;
  error: string;
}

const CACHE_KEY = "public:published-cities";

export function usePublicCities(): IUsePublicCitiesResult {
  const [cities, setCities] = useState<ICity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let isActive: boolean = true;

    async function loadCities(): Promise<void> {
      try {
        setIsLoading(true);
        setError("");

        const response: ICity[] = await getOrCreateSessionPromise(
          CACHE_KEY,
          () => loadPublishedCitiesCatalog(),
        );

        if (!isActive) {
          return;
        }

        setCities(response.filter((item: ICity) => item.published));
      } catch (caught) {
        if (!isActive) {
          return;
        }

        setError(toApiError(caught).message);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadCities();

    return () => {
      isActive = false;
    };
  }, []);

  return {
    cities,
    isLoading,
    error,
  };
}
