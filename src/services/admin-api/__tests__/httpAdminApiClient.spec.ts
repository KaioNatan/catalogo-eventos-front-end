import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import {
  clearAdminUser,
  saveAdminSession,
} from "@/domains/admin-cms/auth/auth.storage";
import type { IAdminAuthSession } from "@/domains/admin-cms/auth/auth.types";
import { ADMIN_AUTH_FORBIDDEN_EVENT } from "../adminAuthEvents";
import { createHttpAdminApiClient } from "../httpAdminApiClient";

const refreshSingleFlightMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue("fresh-access"),
);

const resolveWebImageMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    base64: "e30=",
    mimeType: "image/jpeg",
    filename: "upload.jpg",
  }),
);

vi.mock("../adminAccessTokenRefreshCoordinator", () => ({
  refreshAdminAccessTokenSingleFlight: (...args: unknown[]) =>
    refreshSingleFlightMock(...args),
}));

vi.mock("../adminWebImage", () => ({
  resolveWebImagePayloadFromImageUrlField: (...args: unknown[]) =>
    resolveWebImageMock(...args),
}));

const ISO = "2024-01-02T00:00:00.000Z";

function collectionBody(
  items: unknown[],
  meta?: { page?: number; limit?: number; total?: number; totalPages?: number },
) {
  return {
    data: items,
    meta: {
      page: meta?.page ?? 1,
      limit: meta?.limit ?? 10,
      total: meta?.total ?? items.length,
      totalPages: meta?.totalPages ?? 1,
    },
  };
}

function resourceBody(row: Record<string, unknown>) {
  return { data: row };
}

function institutionalRow(
  id: number,
  updatedAt: string,
): Record<string, unknown> {
  return {
    id,
    aboutTitle: "A",
    aboutText: "at",
    whoWeAreTitle: "w",
    whoWeAreText: "wt",
    purposeTitle: "p",
    purposeText: "pt",
    mission: "m",
    vision: "v",
    valuesJson: "[]",
    updatedAt,
  };
}

function cityRow(id: number): Record<string, unknown> {
  return {
    id,
    name: "Cidade",
    state: "SP",
    slug: "cidade",
    summary: "s",
    description: "d",
    imageUrl: "https://x/img.jpg",
    published: true,
    createdAt: ISO,
    updatedAt: ISO,
  };
}

function eventRow(id: number): Record<string, unknown> {
  return {
    id,
    cityId: 1,
    citySlug: "cidade",
    name: "Evento",
    description: "d",
    featured: false,
    published: true,
    createdAt: ISO,
    updatedAt: ISO,
  };
}

function touristPointRow(id: number): Record<string, unknown> {
  return {
    id,
    cityId: 1,
    citySlug: "cidade",
    name: "Ponto",
    description: "d",
    featured: false,
    published: true,
    createdAt: ISO,
    updatedAt: ISO,
  };
}

interface IMockAxiosHandles {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
  del: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  request: ReturnType<typeof vi.fn>;
  runResponseReject: (err: unknown) => Promise<unknown>;
  applyRequestInterceptors: (
    config: InternalAxiosRequestConfig,
  ) => InternalAxiosRequestConfig;
}

let mockHandles: IMockAxiosHandles;

function attachAxiosCreateMock(): void {
  vi.spyOn(axios, "create").mockImplementation(() => {
    const requestInterceptors: Array<
      (c: InternalAxiosRequestConfig) => InternalAxiosRequestConfig
    > = [];
    let responseReject: ((e: unknown) => Promise<unknown>) | undefined;

    const get = vi.fn();
    const post = vi.fn();
    const patch = vi.fn();
    const del = vi.fn();
    const put = vi.fn();
    const request = vi.fn();

    const instance = {
      defaults: {},
      interceptors: {
        request: {
          use: (
            fn: (c: InternalAxiosRequestConfig) => InternalAxiosRequestConfig,
          ) => {
            requestInterceptors.push(fn);
            return 0;
          },
        },
        response: {
          use: (_onOk: unknown, onReject: (e: unknown) => Promise<unknown>) => {
            responseReject = onReject;
            return 0;
          },
        },
      },
      get,
      post,
      patch,
      delete: del,
      put,
      request,
    };

    mockHandles = {
      get,
      post,
      patch,
      del,
      put,
      request,
      runResponseReject: (err: unknown) => responseReject!(err),
      applyRequestInterceptors: (config: InternalAxiosRequestConfig) =>
        requestInterceptors.reduce(
          (acc: InternalAxiosRequestConfig, fn) => fn(acc),
          config,
        ),
    };

    return instance as unknown as ReturnType<typeof axios.create>;
  });
}

function buildAxiosError(status: number, url: string): AxiosError {
  const config = { url, headers: {} } as InternalAxiosRequestConfig;
  const err = new AxiosError(`Error ${status}`, String(status), config);
  err.response = {
    status,
    data: {},
    statusText: "",
    headers: {},
    config,
  };
  return err;
}

const sessionFixture: IAdminAuthSession = {
  accessToken: "acc-token",
  refreshToken: "ref-token",
  user: {
    id: 1,
    name: "Admin",
    email: "a@b.com",
    role: "Admin",
    token: "acc-token",
  },
};

describe("createHttpAdminApiClient", () => {
  beforeEach(() => {
    clearAdminUser();
    refreshSingleFlightMock.mockClear();
    refreshSingleFlightMock.mockResolvedValue("fresh-access");
    resolveWebImageMock.mockClear();
    resolveWebImageMock.mockResolvedValue({
      base64: "e30=",
      mimeType: "image/jpeg",
      filename: "upload.jpg",
    });
    attachAxiosCreateMock();
  });

  afterEach(() => {
    clearAdminUser();
    vi.restoreAllMocks();
  });

  it("injeta Authorization Bearer a partir da sessão HTTP admin", () => {
    saveAdminSession(sessionFixture);
    createHttpAdminApiClient("https://bff.test/");

    const config = {
      headers: {},
      url: "/admin/cities",
    } as InternalAxiosRequestConfig;
    const next: InternalAxiosRequestConfig =
      mockHandles.applyRequestInterceptors(config);

    expect(next.headers?.Authorization).toBe("Bearer acc-token");
  });

  it("em 403 dispara evento de forbidden e rejeita", async () => {
    const dispatchSpy = vi
      .spyOn(window, "dispatchEvent")
      .mockImplementation(() => true);

    createHttpAdminApiClient("https://bff.test/");

    const err = buildAxiosError(403, "/admin/cities");

    await expect(mockHandles.runResponseReject(err)).rejects.toBe(err);

    expect(
      dispatchSpy.mock.calls.some(
        (call) => (call[0] as Event).type === ADMIN_AUTH_FORBIDDEN_EVENT,
      ),
    ).toBe(true);
  });

  it("em 401 tenta refresh single-flight e repete request com novo token", async () => {
    createHttpAdminApiClient("https://bff.test/");

    mockHandles.request.mockResolvedValue({
      data: {
        data: [],
        meta: { page: 1, limit: 12, total: 0, totalPages: 1 },
      },
    });

    const err401 = buildAxiosError(401, "/admin/cities");

    await mockHandles.runResponseReject(err401);

    expect(refreshSingleFlightMock).toHaveBeenCalledWith("https://bff.test/");
    expect(mockHandles.request).toHaveBeenCalled();
    const retriedConfig = mockHandles.request.mock.calls[0]?.[0] as {
      headers?: { Authorization?: string };
    };
    expect(retriedConfig?.headers?.Authorization).toBe("Bearer fresh-access");
  });

  it("não tenta refresh em 401 para rotas de auth", async () => {
    createHttpAdminApiClient("https://bff.test/");

    const errLogin = buildAxiosError(401, "/auth/login");

    await expect(mockHandles.runResponseReject(errLogin)).rejects.toBe(
      errLogin,
    );
    expect(refreshSingleFlightMock).not.toHaveBeenCalled();
  });

  it("listCities mapeia envelope de coleção vazia", async () => {
    const client = createHttpAdminApiClient("https://bff.test/");
    mockHandles.get.mockResolvedValue({
      data: {
        data: [],
        meta: { page: 1, limit: 12, total: 0, totalPages: 1 },
      },
    });

    const cities = await client.listCities();

    expect(cities).toEqual([]);
    expect(mockHandles.get).toHaveBeenCalledWith("/admin/cities");
  });

  describe("institutional", () => {
    it("getInstitutionalContent retorna o mais recente por updatedAt", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.get.mockResolvedValue({
        data: collectionBody([
          institutionalRow(1, "2020-01-01T00:00:00.000Z"),
          institutionalRow(2, "2025-01-01T00:00:00.000Z"),
        ]),
      });

      const row = await client.getInstitutionalContent();

      expect(row?.id).toBe(2);
      expect(mockHandles.get).toHaveBeenCalledWith(
        "/admin/institutional-content",
      );
    });

    it("getInstitutionalContent retorna null quando a coleção está vazia", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.get.mockResolvedValue({ data: collectionBody([]) });

      await expect(client.getInstitutionalContent()).resolves.toBeNull();
    });

    it("createInstitutionalContent envia body e mapeia recurso", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      const created = institutionalRow(9, ISO);
      mockHandles.post.mockResolvedValue({ data: resourceBody(created) });

      const out = await client.createInstitutionalContent({
        aboutTitle: "T",
        aboutText: "a",
        whoWeAreTitle: "w",
        whoWeAreText: "ww",
        purposeTitle: "p",
        purposeText: "pp",
        mission: "m",
        vision: "v",
        values: ["um"],
      });

      expect(out.id).toBe(9);
      expect(mockHandles.post).toHaveBeenCalledWith(
        "/admin/institutional-content",
        expect.objectContaining({
          aboutTitle: "T",
          valuesJson: '["um"]',
        }),
      );
    });

    it("updateInstitutionalContent faz patch no id da listagem quando bate com input.id", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      const after = institutionalRow(5, ISO);
      mockHandles.get.mockResolvedValue({
        data: collectionBody([institutionalRow(5, "2023-01-01T00:00:00.000Z")]),
      });
      mockHandles.patch.mockResolvedValue({ data: resourceBody(after) });

      const out = await client.updateInstitutionalContent({
        id: 5,
        aboutTitle: "Novo",
      });

      expect(out.id).toBe(5);
      expect(mockHandles.patch).toHaveBeenCalledWith(
        "/admin/institutional-content/5",
        { aboutTitle: "Novo" },
      );
    });

    it("updateInstitutionalContent usa o único registro da lista quando id não bate", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.get.mockResolvedValue({
        data: collectionBody([institutionalRow(99, ISO)]),
      });
      mockHandles.patch.mockResolvedValue({
        data: resourceBody(institutionalRow(99, ISO)),
      });

      await client.updateInstitutionalContent({ id: 5, vision: "v2" });

      expect(mockHandles.patch).toHaveBeenCalledWith(
        "/admin/institutional-content/99",
        { vision: "v2" },
      );
    });

    it("updateInstitutionalContent falha sem itens na listagem", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.get.mockResolvedValue({ data: collectionBody([]) });

      await expect(
        client.updateInstitutionalContent({ id: 1, mission: "x" }),
      ).rejects.toThrow(/Nenhum conteúdo institucional/);
    });

    it("updateInstitutionalContent falha com vários registros e id desconhecido", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.get.mockResolvedValue({
        data: collectionBody([
          institutionalRow(1, ISO),
          institutionalRow(2, ISO),
        ]),
      });

      await expect(
        client.updateInstitutionalContent({ id: 999, mission: "x" }),
      ).rejects.toThrow(/não consta na listagem institucional/);
    });
  });

  describe("social links", () => {
    const linkRow: Record<string, unknown> = {
      id: 1,
      platform: "instagram",
      label: "IG",
      url: "https://ig",
      active: true,
      order: 0,
    };

    it("listSocialLinks mapeia coleção", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.get.mockResolvedValue({ data: collectionBody([linkRow]) });

      const list = await client.listSocialLinks();

      expect(list).toHaveLength(1);
      expect(list[0]?.id).toBe(1);
      expect(mockHandles.get).toHaveBeenCalledWith("/admin/social-links");
    });

    it("createSocialLink envia input e mapeia recurso", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.post.mockResolvedValue({ data: resourceBody(linkRow) });

      const out = await client.createSocialLink({
        platform: "instagram",
        label: "IG",
        url: "https://ig",
        active: true,
        order: 0,
      });

      expect(out.id).toBe(1);
      expect(mockHandles.post).toHaveBeenCalledWith("/admin/social-links", {
        platform: "instagram",
        label: "IG",
        url: "https://ig",
        active: true,
        order: 0,
      });
    });

    it("updateSocialLink envia patch sem id no corpo", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.patch.mockResolvedValue({ data: resourceBody(linkRow) });

      await client.updateSocialLink({
        id: 1,
        label: "Novo",
      });

      expect(mockHandles.patch).toHaveBeenCalledWith("/admin/social-links/1", {
        label: "Novo",
      });
    });

    it("deleteSocialLink chama DELETE", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.del.mockResolvedValue({ data: {} });

      await client.deleteSocialLink(7);

      expect(mockHandles.del).toHaveBeenCalledWith("/admin/social-links/7");
    });
  });

  describe("cities (HTTP além de listCities)", () => {
    it("getCityById mapeia recurso", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.get.mockResolvedValue({ data: resourceBody(cityRow(3)) });

      const city = await client.getCityById(3);

      expect(city?.id).toBe(3);
      expect(mockHandles.get).toHaveBeenCalledWith("/admin/cities/3");
    });

    it("getCityById retorna null em 404", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.get.mockRejectedValue(
        buildAxiosError(404, "/admin/cities/9"),
      );

      await expect(client.getCityById(9)).resolves.toBeNull();
    });

    it("getCityBySlug usa rota pública com slug codificado", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.get.mockResolvedValue({ data: resourceBody(cityRow(1)) });

      await client.getCityBySlug("são paulo");

      expect(mockHandles.get).toHaveBeenCalledWith(
        `/public/cities/${encodeURIComponent("são paulo")}`,
      );
    });

    it("getCityBySlug retorna null em 404", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.get.mockRejectedValue(
        buildAxiosError(404, "/public/cities/x"),
      );

      await expect(client.getCityBySlug("x")).resolves.toBeNull();
    });

    it("createCity resolve imagem e envia payload no POST", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.post.mockResolvedValue({ data: resourceBody(cityRow(1)) });

      await client.createCity({
        name: "N",
        slug: "n",
        state: "RJ",
        summary: "s",
        description: "d",
        published: true,
        imageUrl: "data:image/png;base64,AA",
      });

      expect(resolveWebImageMock).toHaveBeenCalled();
      expect(mockHandles.post).toHaveBeenCalledWith(
        "/admin/cities",
        expect.objectContaining({
          name: "N",
          image: expect.objectContaining({ base64: "e30=" }),
        }),
      );
    });

    it("updateCity com imageUrl inclui image resolvida no PATCH", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.patch.mockResolvedValue({ data: resourceBody(cityRow(2)) });

      await client.updateCity({
        id: 2,
        imageUrl: "https://x/p.png",
      });

      expect(mockHandles.patch).toHaveBeenCalledWith(
        "/admin/cities/2",
        expect.objectContaining({
          image: expect.objectContaining({ mimeType: "image/jpeg" }),
        }),
      );
    });

    it("deleteCity chama DELETE", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.del.mockResolvedValue({ data: {} });

      await client.deleteCity(4);

      expect(mockHandles.del).toHaveBeenCalledWith("/admin/cities/4");
    });
  });

  describe("events", () => {
    it("listEvents usa paginação fixa no GET", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.get.mockResolvedValue({ data: collectionBody([]) });

      await client.listEvents();

      expect(mockHandles.get).toHaveBeenCalledWith("/admin/events", {
        params: { page: 1, limit: 100, sortDir: "asc" },
      });
    });

    it("listEventsForPick repassa busca e categoria", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.get.mockResolvedValue({ data: collectionBody([]) });

      await client.listEventsForPick({
        page: 2,
        limit: 5,
        search: "  festa ",
        category: "  música ",
      });

      expect(mockHandles.get).toHaveBeenCalledWith("/admin/events", {
        params: {
          page: 2,
          limit: 5,
          sortDir: "asc",
          name: "festa",
          category: "música",
        },
      });
    });

    it("getEventById mapeia recurso", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.get.mockResolvedValue({ data: resourceBody(eventRow(8)) });

      const ev = await client.getEventById(8);

      expect(ev?.id).toBe(8);
    });

    it("getEventById retorna null em 404", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.get.mockRejectedValue(
        buildAxiosError(404, "/admin/events/8"),
      );

      await expect(client.getEventById(8)).resolves.toBeNull();
    });

    it("createEvent envia imagem resolvida", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.post.mockResolvedValue({ data: resourceBody(eventRow(1)) });

      await client.createEvent({
        cityId: 1,
        citySlug: "c",
        name: "E",
        description: "d",
        featured: false,
        published: true,
        imageUrl: "data:image/jpeg;base64,xx",
      });

      expect(mockHandles.post).toHaveBeenCalledWith(
        "/admin/events",
        expect.objectContaining({ image: expect.any(Object) }),
      );
    });

    it("updateEvent troca imageUrl por image quando informada", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.patch.mockResolvedValue({ data: resourceBody(eventRow(1)) });

      await client.updateEvent({
        id: 1,
        name: "N",
        imageUrl: "https://img",
      });

      expect(mockHandles.patch).toHaveBeenCalledWith(
        "/admin/events/1",
        expect.objectContaining({
          image: expect.any(Object),
          name: "N",
        }),
      );
      const body = mockHandles.patch.mock.calls[0]?.[1] as Record<
        string,
        unknown
      >;
      expect(body.imageUrl).toBeUndefined();
    });

    it("deleteEvent chama DELETE", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.del.mockResolvedValue({ data: {} });

      await client.deleteEvent(3);

      expect(mockHandles.del).toHaveBeenCalledWith("/admin/events/3");
    });
  });

  describe("tourist points", () => {
    it("listTouristPoints agrega páginas até totalPages", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.get
        .mockResolvedValueOnce({
          data: collectionBody([touristPointRow(1)], {
            page: 1,
            totalPages: 2,
            total: 2,
            limit: 50,
          }),
        })
        .mockResolvedValueOnce({
          data: collectionBody([touristPointRow(2)], {
            page: 2,
            totalPages: 2,
            total: 2,
            limit: 50,
          }),
        });

      const all = await client.listTouristPoints();

      expect(all.map((p) => p.id)).toEqual([1, 2]);
      expect(mockHandles.get).toHaveBeenCalledTimes(2);
      expect(mockHandles.get).toHaveBeenNthCalledWith(
        1,
        "/admin/tourist-points",
        { params: { page: 1, limit: 50, sortDir: "asc" } },
      );
      expect(mockHandles.get).toHaveBeenNthCalledWith(
        2,
        "/admin/tourist-points",
        { params: { page: 2, limit: 50, sortDir: "asc" } },
      );
    });

    it("listTouristPointsForPick repassa params", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.get.mockResolvedValue({ data: collectionBody([]) });

      await client.listTouristPointsForPick({ search: "x", category: "c" });

      expect(mockHandles.get).toHaveBeenCalledWith("/admin/tourist-points", {
        params: {
          page: 1,
          limit: 30,
          sortDir: "asc",
          name: "x",
          category: "c",
        },
      });
    });

    it("getTouristPointById mapeia recurso", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.get.mockResolvedValue({
        data: resourceBody(touristPointRow(11)),
      });

      const tp = await client.getTouristPointById(11);

      expect(tp?.id).toBe(11);
      expect(mockHandles.get).toHaveBeenCalledWith("/admin/tourist-points/11");
    });

    it("getTouristPointById retorna null em 404", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.get.mockRejectedValue(
        buildAxiosError(404, "/admin/tourist-points/1"),
      );

      await expect(client.getTouristPointById(1)).resolves.toBeNull();
    });

    it("createTouristPoint envia POST com imagem", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.post.mockResolvedValue({
        data: resourceBody(touristPointRow(1)),
      });

      await client.createTouristPoint({
        cityId: 1,
        citySlug: "c",
        name: "P",
        description: "d",
        featured: false,
        published: true,
        imageUrl: "data:image/png;base64,AA",
      });

      expect(mockHandles.post).toHaveBeenCalledWith(
        "/admin/tourist-points",
        expect.objectContaining({ image: expect.any(Object) }),
      );
    });

    it("updateTouristPoint usa PUT", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.put.mockResolvedValue({
        data: resourceBody(touristPointRow(5)),
      });

      await client.updateTouristPoint({
        id: 5,
        name: "Alt",
      });

      expect(mockHandles.put).toHaveBeenCalledWith(
        "/admin/tourist-points/5",
        expect.objectContaining({ name: "Alt" }),
      );
    });

    it("deleteTouristPoint chama DELETE", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.del.mockResolvedValue({ data: {} });

      await client.deleteTouristPoint(9);

      expect(mockHandles.del).toHaveBeenCalledWith("/admin/tourist-points/9");
    });
  });

  describe("home banners e highlights", () => {
    const bannerRow: Record<string, unknown> = {
      id: 1,
      title: "B",
      subtitle: "Sub",
      imageUrl: "https://i",
      ctaLabel: "C",
      ctaUrl: "https://c",
      active: true,
      order: 0,
    };

    const highlightRow: Record<string, unknown> = {
      id: 1,
      type: "event",
      referenceId: "10",
      title: "H",
      description: "D",
      cityName: "Cidade",
      imageUrl: "https://h",
      ctaUrl: "https://c",
      active: true,
      order: 0,
    };

    it("listHomeBanners mapeia coleção", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.get.mockResolvedValue({ data: collectionBody([bannerRow]) });

      const list = await client.listHomeBanners();

      expect(list[0]?.title).toBe("B");
    });

    it("createHomeBanner normaliza subtitle curto e defaults de CTA", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.post.mockResolvedValue({ data: resourceBody(bannerRow) });

      await client.createHomeBanner({
        title: "T",
        subtitle: "ab",
        imageUrl: "data:image/jpeg;base64,xx",
        active: true,
        order: 0,
      });

      expect(mockHandles.post).toHaveBeenCalledWith(
        "/admin/home-banners",
        expect.objectContaining({
          subtitle: "Subtítulo",
          ctaLabel: "Saiba mais",
          ctaUrl: "https://example.com",
        }),
      );
    });

    it("updateHomeBanner troca imageUrl por image", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.patch.mockResolvedValue({ data: resourceBody(bannerRow) });

      await client.updateHomeBanner({
        id: 1,
        imageUrl: "https://x",
      });

      expect(mockHandles.patch).toHaveBeenCalledWith(
        "/admin/home-banners/1",
        expect.objectContaining({ image: expect.any(Object) }),
      );
    });

    it("deleteHomeBanner chama DELETE", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.del.mockResolvedValue({ data: {} });

      await client.deleteHomeBanner(2);

      expect(mockHandles.del).toHaveBeenCalledWith("/admin/home-banners/2");
    });

    it("listHomeHighlights mapeia coleção", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.get.mockResolvedValue({
        data: collectionBody([highlightRow]),
      });

      const list = await client.listHomeHighlights();

      expect(list[0]?.type).toBe("event");
    });

    it("createHomeHighlight exige referenceId numérico", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");

      await expect(
        client.createHomeHighlight({
          type: "event",
          title: "T",
          description: "D",
          active: true,
          order: 0,
          imageUrl: "data:image/jpeg;base64,xx",
        }),
      ).rejects.toThrow(/referenceId numérico/);
    });

    it("createHomeHighlight envia referenceId numérico e cityName mínimo", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.post.mockResolvedValue({ data: resourceBody(highlightRow) });

      await client.createHomeHighlight({
        type: "event",
        referenceId: "42",
        title: "T",
        description: "D",
        cityName: "RJ",
        imageUrl: "data:image/jpeg;base64,xx",
        active: true,
        order: 1,
      });

      expect(mockHandles.post).toHaveBeenCalledWith(
        "/admin/home-highlights",
        expect.objectContaining({
          referenceId: 42,
          cityName: "Cidade",
        }),
      );
    });

    it("updateHomeHighlight converte referenceId e aceita image", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.patch.mockResolvedValue({ data: resourceBody(highlightRow) });

      await client.updateHomeHighlight({
        id: 3,
        referenceId: "7",
        imageUrl: "https://z",
      });

      expect(mockHandles.patch).toHaveBeenCalledWith(
        "/admin/home-highlights/3",
        expect.objectContaining({
          referenceId: 7,
          image: expect.any(Object),
        }),
      );
    });

    it("deleteHomeHighlight chama DELETE", async () => {
      const client = createHttpAdminApiClient("https://bff.test/");
      mockHandles.del.mockResolvedValue({ data: {} });

      await client.deleteHomeHighlight(4);

      expect(mockHandles.del).toHaveBeenCalledWith("/admin/home-highlights/4");
    });
  });
});
