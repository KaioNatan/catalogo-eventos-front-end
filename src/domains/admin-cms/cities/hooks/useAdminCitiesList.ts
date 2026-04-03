import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { ICity } from "@/entities/city/city.types";
import { adminApiClient } from "@/services/admin-api/client";

export interface IUseAdminCitiesListResult {
  items: ICity[];
  setItems: Dispatch<SetStateAction<ICity[]>>;
  isLoading: boolean;
  error: string;
  reload: () => Promise<void>;
}

export function useAdminCitiesList(): IUseAdminCitiesListResult {
  const [items, setItems] = useState<ICity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const reload = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError("");

      const response: ICity[] = await adminApiClient.listCities();
      setItems(response);
    } catch {
      setError("Não foi possível carregar as cidades.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { items, isLoading, error, reload, setItems };
}
