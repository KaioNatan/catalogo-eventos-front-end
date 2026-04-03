import { useEffect, useState } from "react";
import type { ICity } from "@/entities/city/city.types";
import type { ITouristPoint } from "@/entities/tourist-point/touristPoint.types";
import { adminApiClient } from "@/services/admin-api/client";

export interface IUseAdminTouristPointFormSourceResult {
  cities: ICity[];
  touristPoint: ITouristPoint | null;
  isLoading: boolean;
  error: string;
  notFound: boolean;
}

export function useAdminTouristPointFormSource(
  touristPointId: number | undefined,
): IUseAdminTouristPointFormSourceResult {
  const [cities, setCities] = useState<ICity[]>([]);
  const [touristPoint, setTouristPoint] = useState<ITouristPoint | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [notFound, setNotFound] = useState<boolean>(false);

  useEffect(() => {
    let isActive: boolean = true;

    async function loadData(): Promise<void> {
      try {
        setIsLoading(true);
        setError("");
        setNotFound(false);
        setTouristPoint(null);

        const [citiesResponse, entityResponse] = await Promise.all([
          adminApiClient.listCities(),
          touristPointId
            ? adminApiClient.getTouristPointById(touristPointId)
            : Promise.resolve(null),
        ]);

        if (!isActive) {
          return;
        }

        setCities(citiesResponse);

        if (!touristPointId) {
          return;
        }

        if (!entityResponse) {
          setNotFound(true);
          return;
        }

        setTouristPoint(entityResponse);
      } catch {
        if (!isActive) {
          return;
        }

        setError("Não foi possível carregar os dados do formulário.");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      isActive = false;
    };
  }, [touristPointId]);

  return { cities, touristPoint, isLoading, error, notFound };
}
