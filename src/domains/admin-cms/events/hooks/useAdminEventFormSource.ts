import { useEffect, useState } from "react";
import type { ICity } from "@/entities/city/city.types";
import type { IEvent } from "@/entities/event/event.types";
import { toApiError } from "@/services/api/apiError";
import { getAdminEventById } from "@/services/admin-api/adminEvents.api";
import { adminApiClient } from "@/services/admin-api/client";

export interface IUseAdminEventFormSourceResult {
  cities: ICity[];
  /** Em modo edição, o evento carregado; em criação, `null` após o load. */
  event: IEvent | null;
  isLoading: boolean;
  error: string;
  notFound: boolean;
}

export function useAdminEventFormSource(
  eventId: number | undefined,
): IUseAdminEventFormSourceResult {
  const [cities, setCities] = useState<ICity[]>([]);
  const [event, setEvent] = useState<IEvent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [notFound, setNotFound] = useState<boolean>(false);

  useEffect(() => {
    let isActive: boolean = true;

    async function loadData(): Promise<void> {
      try {
        setIsLoading(true);
        setError("");
        setNotFound(false);
        setEvent(null);

        const [citiesResponse, eventResponse] = await Promise.all([
          adminApiClient.listCities(),
          eventId ? getAdminEventById(eventId) : Promise.resolve(null),
        ]);

        if (!isActive) {
          return;
        }

        setCities(citiesResponse);

        if (!eventId) {
          return;
        }

        if (!eventResponse) {
          setNotFound(true);
          return;
        }

        setEvent(eventResponse);
      } catch (caught) {
        if (!isActive) {
          return;
        }

        setError(toApiError(caught).message);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      isActive = false;
    };
  }, [eventId]);

  return { cities, event, isLoading, error, notFound };
}
