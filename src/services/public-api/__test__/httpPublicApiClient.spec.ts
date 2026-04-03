import { ApiError } from "@/services/api/apiError";
import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGet, mockCreate } = vi.hoisted(() => {
  const mockGet = vi.fn();
  const mockCreate = vi.fn(() => ({ get: mockGet }));
  return { mockGet, mockCreate };
});

vi.mock("axios", async (importOriginal) => {
  const actual = await importOriginal<typeof import("axios")>();
  return {
    ...actual,
    default: {
      ...actual.default,
      create: (...args: Parameters<typeof mockCreate>) =>
        mockCreate(...(args as Parameters<typeof mockCreate>)),
    },
  };
});

import { createHttpPublicApiClient } from "../httpPublicApiClient";

function collectionBody<T>(
  items: T[],
  meta: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  } = {},
) {
  return {
    data: items,
    links: {},
    meta: {
      page: 1,
      limit: 10,
      total: items.length,
      totalPages: 1,
      ...meta,
    },
  };
}

function resourceBody<T>(data: T) {
  return { data, links: {} };
}

describe("createHttpPublicApiClient (axios mockado)", () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockCreate.mockClear();
  });

  it("configura axios com baseURL sem barra final", () => {
    createHttpPublicApiClient("https://api.example/api/");
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: "https://api.example/api",
        headers: { Accept: "application/json" },
        timeout: 30_000,
      }),
    );
  });

  it("listPublishedCities filtra apenas publicadas", async () => {
    mockGet.mockResolvedValueOnce({
      data: collectionBody([
        {
          id: 1,
          name: "A",
          state: "MS",
          slug: "a",
          summary: "s",
          published: true,
        },
        {
          id: 2,
          name: "B",
          state: "MS",
          slug: "b",
          summary: "s",
          published: false,
        },
      ]),
    });

    const client = createHttpPublicApiClient("https://x/api");
    const cities = await client.listPublishedCities();

    expect(mockGet).toHaveBeenCalledWith("/public/cities");
    expect(cities).toHaveLength(1);
    expect(cities[0]?.slug).toBe("a");
  });

  it("getPublishedCityBySlug retorna cidade ou null (404 / não publicada)", async () => {
    const client = createHttpPublicApiClient("https://x/api");

    mockGet.mockResolvedValueOnce({
      data: resourceBody({
        id: 1,
        name: "A",
        state: "MS",
        slug: "a",
        summary: "",
        published: true,
      }),
    });
    await expect(client.getPublishedCityBySlug("a")).resolves.toMatchObject({
      slug: "a",
      published: true,
    });

    mockGet.mockResolvedValueOnce({
      data: resourceBody({
        id: 2,
        name: "B",
        state: "MS",
        slug: "b",
        summary: "",
        published: false,
      }),
    });
    await expect(client.getPublishedCityBySlug("b")).resolves.toBeNull();

    mockGet.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 404 },
    });
    await expect(client.getPublishedCityBySlug("missing")).resolves.toBeNull();
  });

  it("getPublishedCityBySlug propaga falha que não é 404", async () => {
    const axiosErr = new AxiosError("falha");
    axiosErr.response = {
      status: 503,
      data: {},
      statusText: "",
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };
    mockGet.mockRejectedValueOnce(axiosErr);
    const client = createHttpPublicApiClient("https://x/api");
    await expect(client.getPublishedCityBySlug("x")).rejects.toSatisfy(
      (e: unknown) => ApiError.isApiError(e) && e.status === 503,
    );
  });

  it("listPublishedEvents envia cityId e resolve citySlug via GET cidade", async () => {
    const client = createHttpPublicApiClient("https://x/api");

    mockGet.mockResolvedValueOnce({
      data: resourceBody({
        id: 7,
        name: "Dourados",
        state: "MS",
        slug: "dourados",
        summary: "",
        published: true,
      }),
    });
    mockGet.mockResolvedValueOnce({
      data: collectionBody([
        {
          id: 10,
          cityId: 7,
          citySlug: "dourados",
          name: "Fest",
          description: "d",
          category: "Show",
          featured: false,
          published: true,
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-02T00:00:00.000Z",
        },
      ]),
    });

    const result = await client.listPublishedEvents({
      citySlug: "dourados",
      search: "Fest",
      category: "Show",
      page: 2,
      limit: 5,
    });

    expect(mockGet).toHaveBeenNthCalledWith(1, "/public/cities/dourados", {
      signal: undefined,
    });
    expect(mockGet).toHaveBeenNthCalledWith(2, "/public/events", {
      params: {
        page: "2",
        limit: "5",
        sortDir: "asc",
        name: "Fest",
        category: "Show",
        cityId: 7,
      },
      signal: undefined,
    });
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it("listPublishedEvents com citySlug inexistente retorna vazio sem chamar /public/events", async () => {
    mockGet.mockRejectedValueOnce(new Error("network"));
    const client = createHttpPublicApiClient("https://x/api");
    const result = await client.listPublishedEvents({
      citySlug: "nope",
      page: 1,
      limit: 10,
    });
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it("listPublishedEvents com cityId não chama slug", async () => {
    mockGet.mockResolvedValueOnce({
      data: collectionBody([]),
    });
    const client = createHttpPublicApiClient("https://x/api");
    await client.listPublishedEvents({ cityId: 3, page: 1, limit: 10 });
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith("/public/events", {
      params: {
        page: "1",
        limit: "10",
        sortDir: "asc",
        cityId: 3,
      },
    });
  });

  it("getPublishedEventById ignora não publicado e 404", async () => {
    const client = createHttpPublicApiClient("https://x/api");

    mockGet.mockResolvedValueOnce({
      data: resourceBody({
        id: 1,
        cityId: 1,
        citySlug: "a",
        name: "E",
        description: "",
        published: false,
        featured: false,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      }),
    });
    await expect(client.getPublishedEventById(1)).resolves.toBeNull();

    mockGet.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 404 },
    });
    await expect(client.getPublishedEventById(999)).resolves.toBeNull();
  });

  it("getPublishedEventById propaga falha que não é 404", async () => {
    const axiosErr = new AxiosError("falha");
    axiosErr.response = {
      status: 500,
      data: {},
      statusText: "",
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };
    mockGet.mockRejectedValueOnce(axiosErr);
    const client = createHttpPublicApiClient("https://x/api");
    await expect(client.getPublishedEventById(1)).rejects.toSatisfy(
      (e: unknown) => ApiError.isApiError(e) && e.status === 500,
    );
  });

  it("getPublishedTouristPointById retorna null para não publicado e 404", async () => {
    const client = createHttpPublicApiClient("https://x/api");

    mockGet.mockResolvedValueOnce({
      data: resourceBody({
        id: 1,
        cityId: 1,
        citySlug: "a",
        name: "P",
        description: "",
        published: false,
        featured: false,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      }),
    });
    await expect(client.getPublishedTouristPointById(1)).resolves.toBeNull();

    mockGet.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 404 },
    });
    await expect(client.getPublishedTouristPointById(999)).resolves.toBeNull();
  });

  it("getPublishedTouristPointById propaga falha que não é 404", async () => {
    const axiosErr = new AxiosError("falha");
    axiosErr.response = {
      status: 502,
      data: {},
      statusText: "",
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };
    mockGet.mockRejectedValueOnce(axiosErr);
    const client = createHttpPublicApiClient("https://x/api");
    await expect(client.getPublishedTouristPointById(1)).rejects.toSatisfy(
      (e: unknown) => ApiError.isApiError(e) && e.status === 502,
    );
  });

  it("listPublishedEventByCityId agrega páginas até totalPages", async () => {
    mockGet
      .mockResolvedValueOnce({
        data: collectionBody(
          [
            {
              id: 1,
              cityId: 5,
              citySlug: "x",
              name: "A",
              description: "",
              published: true,
              featured: false,
              createdAt: "2024-01-01T00:00:00.000Z",
              updatedAt: "2024-01-01T00:00:00.000Z",
            },
          ],
          { page: 1, limit: 100, total: 2, totalPages: 2 },
        ),
      })
      .mockResolvedValueOnce({
        data: collectionBody(
          [
            {
              id: 2,
              cityId: 5,
              citySlug: "x",
              name: "B",
              description: "",
              published: true,
              featured: false,
              createdAt: "2024-01-01T00:00:00.000Z",
              updatedAt: "2024-01-01T00:00:00.000Z",
            },
          ],
          { page: 2, limit: 100, total: 2, totalPages: 2 },
        ),
      });

    const client = createHttpPublicApiClient("https://x/api");
    const items = await client.listPublishedEventByCityId(5);
    expect(items?.map((e) => e.id)).toEqual([1, 2]);
    expect(mockGet).toHaveBeenCalledTimes(2);
  });

  it("listPublishedTouristPoints envia published true e city", async () => {
    mockGet.mockResolvedValueOnce({
      data: collectionBody([]),
    });
    const client = createHttpPublicApiClient("https://x/api");
    await client.listPublishedTouristPoints({
      citySlug: "dourados",
      search: "parque",
      page: 1,
      limit: 20,
    });
    expect(mockGet).toHaveBeenCalledWith("/public/tourist-points", {
      params: {
        page: "1",
        limit: "20",
        published: "true",
        name: "parque",
        city: "dourados",
      },
    });
  });

  it("listPublishedTouristPoints filtra category no cliente", async () => {
    mockGet.mockResolvedValueOnce({
      data: collectionBody([
        {
          id: 1,
          cityId: 1,
          citySlug: "a",
          name: "P",
          description: "",
          category: "parque",
          published: true,
          featured: false,
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
        {
          id: 2,
          cityId: 1,
          citySlug: "a",
          name: "M",
          description: "",
          category: "museu",
          published: true,
          featured: false,
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
      ]),
    });
    const client = createHttpPublicApiClient("https://x/api");
    const r = await client.listPublishedTouristPoints({
      category: "museu",
      page: 1,
      limit: 50,
    });
    expect(r.items).toHaveLength(1);
    expect(r.items[0]?.category).toBe("museu");
    expect(r.total).toBe(1);
  });

  it("listPublishedTouristPointByCityId retorna null se cidade 404", async () => {
    mockGet.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 404 },
    });
    const client = createHttpPublicApiClient("https://x/api");
    await expect(
      client.listPublishedTouristPointByCityId(1),
    ).resolves.toBeNull();
  });

  it("listPublishedTouristPointByCityId lista por slug e filtra cityId", async () => {
    mockGet.mockResolvedValueOnce({
      data: resourceBody({
        id: 9,
        name: "C",
        state: "MS",
        slug: "c-slug",
        summary: "",
        published: true,
      }),
    });
    mockGet.mockResolvedValueOnce({
      data: collectionBody([
        {
          id: 100,
          cityId: 9,
          citySlug: "c-slug",
          name: "PT",
          description: "",
          category: "parque",
          published: true,
          featured: false,
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
        {
          id: 101,
          cityId: 8,
          citySlug: "other",
          name: "Outro",
          description: "",
          category: "parque",
          published: true,
          featured: false,
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
        },
      ]),
    });

    const client = createHttpPublicApiClient("https://x/api");
    const pts = await client.listPublishedTouristPointByCityId(9);
    expect(pts?.map((p) => p.id)).toEqual([100]);
    expect(mockGet).toHaveBeenNthCalledWith(1, "/public/cities/by-id/9");
    expect(mockGet).toHaveBeenNthCalledWith(2, "/public/tourist-points", {
      params: {
        page: 1,
        limit: 50,
        published: "true",
        city: "c-slug",
      },
    });
  });

  it("getInstitutionalContent escolhe updatedAt mais recente e parseia valuesJson", async () => {
    mockGet.mockResolvedValueOnce({
      data: collectionBody([
        {
          id: 1,
          aboutTitle: "Old",
          aboutText: "",
          whoWeAreTitle: "",
          whoWeAreText: "",
          purposeTitle: "",
          purposeText: "",
          mission: "",
          vision: "",
          valuesJson: '["a"]',
          updatedAt: "2020-01-01T00:00:00.000Z",
        },
        {
          id: 2,
          aboutTitle: "New",
          aboutText: "t",
          whoWeAreTitle: "",
          whoWeAreText: "",
          purposeTitle: "",
          purposeText: "",
          mission: "m",
          vision: "v",
          valuesJson: '["x","y"]',
          updatedAt: "2025-06-01T00:00:00.000Z",
        },
      ]),
    });
    const client = createHttpPublicApiClient("https://x/api");
    const inst = await client.getInstitutionalContent();
    expect(inst.aboutTitle).toBe("New");
    expect(inst.values).toEqual(["x", "y"]);
  });

  it("getInstitutionalContent lança se lista vazia", async () => {
    mockGet.mockResolvedValueOnce({ data: collectionBody([]) });
    const client = createHttpPublicApiClient("https://x/api");
    await expect(client.getInstitutionalContent()).rejects.toThrow(
      "Conteúdo institucional não encontrado",
    );
  });

  it("listActiveSocialLinks filtra e ordena por order", async () => {
    mockGet.mockResolvedValueOnce({
      data: collectionBody([
        {
          id: 1,
          platform: "instagram",
          label: "b",
          url: "u",
          active: true,
          order: 2,
        },
        {
          id: 2,
          platform: "facebook",
          label: "a",
          url: "u",
          active: false,
          order: 1,
        },
        {
          id: 3,
          platform: "site",
          label: "c",
          url: "u",
          active: true,
          order: 1,
        },
      ]),
    });
    const client = createHttpPublicApiClient("https://x/api");
    const links = await client.listActiveSocialLinks();
    expect(links.map((l) => l.id)).toEqual([3, 1]);
  });

  it("getHomeContent retorna banners e highlights ativos ordenados", async () => {
    mockGet.mockResolvedValueOnce({
      data: resourceBody({
        banners: [
          {
            id: 1,
            title: "B2",
            imageUrl: "/i",
            active: true,
            order: 2,
          },
          {
            id: 2,
            title: "B1",
            imageUrl: "/i",
            active: true,
            order: 1,
          },
          { id: 3, title: "Off", imageUrl: "/i", active: false, order: 0 },
        ],
        highlights: [
          {
            id: 10,
            type: "custom",
            title: "H",
            description: "d",
            active: true,
            order: 1,
          },
        ],
      }),
    });
    const client = createHttpPublicApiClient("https://x/api");
    const home = await client.getHomeContent();
    expect(home.banners.map((b) => b.title)).toEqual(["B1", "B2"]);
    expect(home.highlights).toHaveLength(1);
    expect(home.highlights[0]?.type).toBe("custom");
  });

  it("getHomeHighlights busca eventos e pontos referenciados", async () => {
    mockGet.mockResolvedValueOnce({
      data: resourceBody({
        banners: [],
        highlights: [
          {
            id: 1,
            type: "event",
            referenceId: 50,
            title: "E",
            description: "",
            active: true,
            order: 1,
          },
          {
            id: 2,
            type: "tourist-point",
            referenceId: 60,
            title: "T",
            description: "",
            active: true,
            order: 2,
          },
        ],
      }),
    });
    mockGet.mockResolvedValueOnce({
      data: resourceBody({
        id: 50,
        cityId: 1,
        citySlug: "a",
        name: "Ev",
        description: "",
        published: true,
        featured: true,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      }),
    });
    mockGet.mockResolvedValueOnce({
      data: resourceBody({
        id: 60,
        cityId: 1,
        citySlug: "a",
        name: "Tp",
        description: "",
        category: "parque",
        published: true,
        featured: false,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      }),
    });

    const client = createHttpPublicApiClient("https://x/api");
    const hi = await client.getHomeHighlights();
    expect(hi.events).toHaveLength(1);
    expect(hi.events[0]?.id).toBe(50);
    expect(hi.touristPoints).toHaveLength(1);
    expect(hi.touristPoints[0]?.id).toBe(60);
    expect(mockGet).toHaveBeenCalledWith("/public/home-content");
    expect(mockGet).toHaveBeenCalledWith("/public/events/50");
    expect(mockGet).toHaveBeenCalledWith("/public/tourist-points/60");
  });

  it("getHomeHighlights ignora destaque cujo GET por id falha e mantém os demais", async () => {
    mockGet.mockResolvedValueOnce({
      data: resourceBody({
        banners: [],
        highlights: [
          {
            id: 1,
            type: "event",
            referenceId: 50,
            title: "E",
            description: "",
            active: true,
            order: 1,
          },
          {
            id: 2,
            type: "tourist-point",
            referenceId: 60,
            title: "T",
            description: "",
            active: true,
            order: 2,
          },
        ],
      }),
    });
    const axiosErr = new AxiosError("down");
    axiosErr.response = {
      status: 503,
      data: {},
      statusText: "",
      headers: {},
      config: {} as InternalAxiosRequestConfig,
    };
    mockGet.mockRejectedValueOnce(axiosErr);
    mockGet.mockResolvedValueOnce({
      data: resourceBody({
        id: 60,
        cityId: 1,
        citySlug: "a",
        name: "Tp",
        description: "",
        category: "parque",
        published: true,
        featured: false,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      }),
    });

    const client = createHttpPublicApiClient("https://x/api");
    const hi = await client.getHomeHighlights();
    expect(hi.events).toHaveLength(0);
    expect(hi.touristPoints).toHaveLength(1);
    expect(hi.touristPoints[0]?.id).toBe(60);
  });
});
