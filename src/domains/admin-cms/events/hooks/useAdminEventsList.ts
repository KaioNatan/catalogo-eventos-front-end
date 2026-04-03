import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { IEvent } from "@/entities/event/event.types";
import { toApiError } from "@/services/api/apiError";
import { listAdminEvents } from "@/services/admin-api/adminEvents.api";

export interface IUseAdminEventsListResult {
  items: IEvent[];
  setItems: Dispatch<SetStateAction<IEvent[]>>;
  isLoading: boolean;
  error: string;
  reload: () => Promise<void>;
}

export function useAdminEventsList(): IUseAdminEventsListResult {
  const [items, setItems] = useState<IEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const reload = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError("");

      const response: IEvent[] = await listAdminEvents();
      setItems(response);
    } catch (caught) {
      setError(toApiError(caught).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { items, setItems, isLoading, error, reload };
}
