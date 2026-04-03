import { useCallback, useEffect, useState } from "react";
import { adminApiClient } from "@/services/admin-api/client";

export interface IAdminDashboardStats {
  cityCount: number;
  eventCount: number;
  touristPointCount: number;
  homeHighlightCount: number;
}

export interface IUseAdminDashboardStatsResult {
  stats: IAdminDashboardStats | null;
  isLoading: boolean;
  error: string;
  reload: () => Promise<void>;
}

export function useAdminDashboardStats(): IUseAdminDashboardStatsResult {
  const [stats, setStats] = useState<IAdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const reload = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError("");

      const [cities, events, touristPoints, homeHighlights] = await Promise.all(
        [
          adminApiClient.listCities(),
          adminApiClient.listEvents(),
          adminApiClient.listTouristPoints(),
          adminApiClient.listHomeHighlights(),
        ],
      );

      setStats({
        cityCount: cities.length,
        eventCount: events.length,
        touristPointCount: touristPoints.length,
        homeHighlightCount: homeHighlights.length,
      });
    } catch {
      setError("Não foi possível carregar os totais do painel.");
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { stats, isLoading, error, reload };
}
