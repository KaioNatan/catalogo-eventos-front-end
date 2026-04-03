import { isValidPublishedCatalogId } from "@/domains/catalogo-publico/shared/utils/isValidPublishedCatalogId";
import type { ITouristPoint } from "@/entities/tourist-point/touristPoint.types";
import { toApiError } from "@/services/api/apiError";
import { publicApiClient } from "@/services/public-api/client";
import { useEffect, useState } from "react";

export interface IUsePublishedTouristPointByIdResult {
  touristPoint: ITouristPoint | null;
  isLoading: boolean;
  notFound: boolean;
  error: string | null;
}

export function usePublishedTouristPointById(
  id: number | undefined,
): IUsePublishedTouristPointByIdResult {
  const [touristPoint, setTouristPoint] = useState<ITouristPoint | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(
    isValidPublishedCatalogId(id),
  );
  const [notFound, setNotFound] = useState<boolean>(
    !isValidPublishedCatalogId(id),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive: boolean = true;

    async function load(): Promise<void> {
      if (!isValidPublishedCatalogId(id)) {
        setTouristPoint(null);
        setError(null);
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        setNotFound(false);
        setTouristPoint(null);

        const response: ITouristPoint | null =
          await publicApiClient.getPublishedTouristPointById(id);

        if (!isActive) {
          return;
        }

        if (!response) {
          setNotFound(true);
          return;
        }

        setTouristPoint(response);
      } catch (caught) {
        if (!isActive) {
          return;
        }
        setError(toApiError(caught).message);
        setNotFound(false);
        setTouristPoint(null);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      isActive = false;
    };
  }, [id]);

  return { touristPoint, isLoading, notFound, error };
}
