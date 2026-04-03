import { useCallback, useEffect, useState } from "react";
import type { IInstitutionalContent } from "@/entities/institutional/institutional.types";
import { adminApiClient } from "@/services/admin-api/client";

export interface IUseAdminInstitutionalContentResult {
  content: IInstitutionalContent | null;
  setContent: (value: IInstitutionalContent | null) => void;
  isLoading: boolean;
  error: string;
  reload: () => Promise<void>;
}

export function useAdminInstitutionalContent(): IUseAdminInstitutionalContentResult {
  const [content, setContent] = useState<IInstitutionalContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const reload = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError("");

      const response: IInstitutionalContent | null =
        await adminApiClient.getInstitutionalContent();
      setContent(response);
    } catch {
      setError("Não foi possível carregar o conteúdo institucional.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { content, setContent, isLoading, error, reload };
}
