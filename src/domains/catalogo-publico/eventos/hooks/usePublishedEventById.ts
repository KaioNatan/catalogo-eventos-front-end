import { isValidPublishedCatalogId } from "@/domains/catalogo-publico/shared/utils/isValidPublishedCatalogId";
import type { IEvent } from "@/entities/event/event.types";
import { toApiError } from "@/services/api/apiError";
import { publicApiClient } from "@/services/public-api/client";
import { useEffect, useState } from "react";

export interface IUsePublishedEventByIdResult {
  event: IEvent | null;
  isLoading: boolean;
  notFound: boolean;
  error: string | null;
}

export function usePublishedEventById(
  id: number | undefined,
): IUsePublishedEventByIdResult {
  const [event, setEvent] = useState<IEvent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(
    isValidPublishedCatalogId(id),
  );
  const [notFound, setNotFound] = useState<boolean>(
    !isValidPublishedCatalogId(id),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive: boolean = true;

    async function loadEvent(): Promise<void> {
      if (!isValidPublishedCatalogId(id)) {
        setEvent(null);
        setError(null);
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        setNotFound(false);
        setEvent(null);

        const response: IEvent | null =
          await publicApiClient.getPublishedEventById(id);

        if (!isActive) {
          return;
        }

        if (!response) {
          setNotFound(true);
          return;
        }

        setEvent(response);
      } catch (caught) {
        if (!isActive) {
          return;
        }
        setError(toApiError(caught).message);
        setNotFound(false);
        setEvent(null);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadEvent();

    return () => {
      isActive = false;
    };
  }, [id]);

  return { event, isLoading, notFound, error };
}
