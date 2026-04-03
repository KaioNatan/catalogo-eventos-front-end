import { useEffect, useState } from "react";
import { getOrCreateSessionPromise } from "@/domains/public-portal/cache/sessionFetchCache";
import type { IPublicHomeContentResponse } from "@/services/public-api/publicApi.types";
import { publicApiClient } from "@/services/public-api/client";

const CACHE_KEY = "public:home-content";

export interface IUsePublicHomeContentResult {
  content: IPublicHomeContentResponse | null;
  isLoading: boolean;
  error: string;
}

export function usePublicHomeContent(): IUsePublicHomeContentResult {
  const [content, setContent] = useState<IPublicHomeContentResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let isActive: boolean = true;

    async function load(): Promise<void> {
      try {
        setIsLoading(true);
        setError("");

        const data: IPublicHomeContentResponse =
          await getOrCreateSessionPromise(CACHE_KEY, () =>
            publicApiClient.getHomeContent(),
          );

        if (!isActive) {
          return;
        }

        setContent(data);
      } catch {
        if (!isActive) {
          return;
        }

        setError("Não foi possível carregar o conteúdo da home.");
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
  }, []);

  return { content, isLoading, error };
}
