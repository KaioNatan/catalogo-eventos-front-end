import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { IHomeBanner } from "@/entities/home-content/homeContent.types";
import { adminApiClient } from "@/services/admin-api/client";

export interface IUseAdminHomeBannersResult {
  items: IHomeBanner[];
  setItems: Dispatch<SetStateAction<IHomeBanner[]>>;
  isLoading: boolean;
  error: string;
  reload: () => Promise<void>;
}

export function useAdminHomeBanners(): IUseAdminHomeBannersResult {
  const [items, setItems] = useState<IHomeBanner[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const reload = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError("");

      const response: IHomeBanner[] = await adminApiClient.listHomeBanners();
      setItems(response);
    } catch {
      setError("Não foi possível carregar os banners.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { items, setItems, isLoading, error, reload };
}
