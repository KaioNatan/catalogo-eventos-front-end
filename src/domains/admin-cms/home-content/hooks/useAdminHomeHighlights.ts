import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { IHomeHighlight } from "@/entities/home-content/homeContent.types";
import { adminApiClient } from "@/services/admin-api/client";

export interface IUseAdminHomeHighlightsResult {
  items: IHomeHighlight[];
  setItems: Dispatch<SetStateAction<IHomeHighlight[]>>;
  isLoading: boolean;
  error: string;
  reload: () => Promise<void>;
}

export function useAdminHomeHighlights(): IUseAdminHomeHighlightsResult {
  const [items, setItems] = useState<IHomeHighlight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const reload = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError("");

      const response: IHomeHighlight[] =
        await adminApiClient.listHomeHighlights();
      setItems(response);
    } catch {
      setError("Não foi possível carregar os destaques.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { items, setItems, isLoading, error, reload };
}
