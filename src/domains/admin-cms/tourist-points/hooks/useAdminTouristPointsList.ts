import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { ITouristPoint } from "@/entities/tourist-point/touristPoint.types";
import { adminApiClient } from "@/services/admin-api/client";

export interface IUseAdminTouristPointsListResult {
  items: ITouristPoint[];
  setItems: Dispatch<SetStateAction<ITouristPoint[]>>;
  isLoading: boolean;
  error: string;
  reload: () => Promise<void>;
}

export function useAdminTouristPointsList(): IUseAdminTouristPointsListResult {
  const [items, setItems] = useState<ITouristPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const reload = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError("");

      const response: ITouristPoint[] =
        await adminApiClient.listTouristPoints();
      setItems(response);
    } catch {
      setError("Não foi possível carregar os pontos turísticos.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { items, setItems, isLoading, error, reload };
}
