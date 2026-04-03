import { useEffect, useState } from "react";
import type { ICity } from "@/entities/city/city.types";
import { adminApiClient } from "@/services/admin-api/client";

export interface IUseAdminCityByIdResult {
  city: ICity | null;
  isLoading: boolean;
  error: string;
  notFound: boolean;
}

export function useAdminCityById(
  cityId: number | undefined,
): IUseAdminCityByIdResult {
  const [city, setCity] = useState<ICity | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(cityId));
  const [error, setError] = useState<string>("");
  const [notFound, setNotFound] = useState<boolean>(false);

  useEffect(() => {
    let isActive: boolean = true;

    async function loadCity(): Promise<void> {
      if (!cityId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const response: ICity | null = await adminApiClient.getCityById(cityId);

        if (!isActive) {
          return;
        }

        if (!response) {
          setNotFound(true);
          return;
        }

        setCity(response);
      } catch {
        if (!isActive) {
          return;
        }

        setError("Não foi possível carregar a cidade.");
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
  }, [cityId]);

  return { city, isLoading, error, notFound };
}
