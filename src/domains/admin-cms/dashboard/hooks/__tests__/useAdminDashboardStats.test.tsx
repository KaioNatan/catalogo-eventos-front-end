import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAdminDashboardStats } from "../useAdminDashboardStats";

vi.mock("@/services/admin-api/client", () => ({
  adminApiClient: {
    listCities: vi.fn(),
    listEvents: vi.fn(),
    listTouristPoints: vi.fn(),
    listHomeHighlights: vi.fn(),
  },
}));

import { adminApiClient } from "@/services/admin-api/client";

describe("useAdminDashboardStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("agrega contagens das listagens admin", async () => {
    vi.mocked(adminApiClient.listCities).mockResolvedValue([
      { id: 1 },
    ] as never);
    vi.mocked(adminApiClient.listEvents).mockResolvedValue([{}, {}] as never);
    vi.mocked(adminApiClient.listTouristPoints).mockResolvedValue([] as never);
    vi.mocked(adminApiClient.listHomeHighlights).mockResolvedValue([
      {},
      {},
      {},
    ] as never);

    const { result } = renderHook(() => useAdminDashboardStats());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("");
    expect(result.current.stats).toEqual({
      cityCount: 1,
      eventCount: 2,
      touristPointCount: 0,
      homeHighlightCount: 3,
    });
    expect(adminApiClient.listCities).toHaveBeenCalledTimes(1);
    expect(adminApiClient.listEvents).toHaveBeenCalledTimes(1);
    expect(adminApiClient.listTouristPoints).toHaveBeenCalledTimes(1);
    expect(adminApiClient.listHomeHighlights).toHaveBeenCalledTimes(1);
  });

  it("expõe erro quando alguma listagem falhar", async () => {
    vi.mocked(adminApiClient.listCities).mockRejectedValue(new Error("falha"));

    const { result } = renderHook(() => useAdminDashboardStats());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.stats).toBeNull();
    expect(result.current.error).toBe(
      "Não foi possível carregar os totais do painel.",
    );
  });
});
