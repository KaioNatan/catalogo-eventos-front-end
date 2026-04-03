import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { ISocialLink } from "@/entities/social-link/socialLink.types";
import { adminApiClient } from "@/services/admin-api/client";

export interface IUseAdminSocialLinksListResult {
  items: ISocialLink[];
  setItems: Dispatch<SetStateAction<ISocialLink[]>>;
  isLoading: boolean;
  error: string;
  reload: () => Promise<void>;
}

export function useAdminSocialLinksList(): IUseAdminSocialLinksListResult {
  const [items, setItems] = useState<ISocialLink[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const reload = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError("");

      const response: ISocialLink[] = await adminApiClient.listSocialLinks();
      setItems(response);
    } catch {
      setError("Não foi possível carregar as mídias sociais.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { items, setItems, isLoading, error, reload };
}
