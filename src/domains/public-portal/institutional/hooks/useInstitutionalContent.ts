import { useEffect, useState } from "react";
import type { IInstitutionalContent } from "@/entities/institutional/institutional.types";
import { getOrCreateSessionPromise } from "@/domains/public-portal/cache/sessionFetchCache";
import { publicApiClient } from "@/services/public-api/client";

interface IUseInstitutionalContentResult {
  content: IInstitutionalContent | null;
  isLoading: boolean;
  error: string;
}

const CACHE_KEY = "public:institutional-content";

export function useInstitutionalContent(): IUseInstitutionalContentResult {
  const [content, setContent] = useState<IInstitutionalContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let isActive: boolean = true;

    async function loadContent(): Promise<void> {
      try {
        setIsLoading(true);
        setError("");

        const response: IInstitutionalContent = await getOrCreateSessionPromise(
          CACHE_KEY,
          () => publicApiClient.getInstitutionalContent(),
        );

        if (!isActive) {
          return;
        }

        setContent(response);
      } catch {
        if (!isActive) {
          return;
        }

        setError("Não foi possível carregar o conteúdo institucional.");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadContent();

    return () => {
      isActive = false;
    };
  }, []);

  return {
    content,
    isLoading,
    error,
  };
}
