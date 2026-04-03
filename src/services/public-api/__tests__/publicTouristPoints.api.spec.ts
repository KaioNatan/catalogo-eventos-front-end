import { describe, expect, it, vi, beforeEach } from "vitest";
import { loadPublishedTouristPointsCatalog } from "../publicTouristPoints.api";

vi.mock("../client", () => ({
  publicApiClient: {
    listPublishedTouristPoints: vi.fn(),
  },
}));

import { publicApiClient } from "../client";

describe("loadPublishedTouristPointsCatalog", () => {
  beforeEach(() => {
    vi.mocked(publicApiClient.listPublishedTouristPoints).mockReset();
  });

  it("delega ao publicApiClient.listPublishedTouristPoints", async () => {
    const payload = {
      items: [],
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0,
    };
    vi.mocked(publicApiClient.listPublishedTouristPoints).mockResolvedValue(
      payload as never,
    );

    const params = { page: 1, limit: 12, citySlug: "dourados" };
    const result = await loadPublishedTouristPointsCatalog(params);

    expect(publicApiClient.listPublishedTouristPoints).toHaveBeenCalledWith(
      params,
    );
    expect(result).toBe(payload);
  });
});
