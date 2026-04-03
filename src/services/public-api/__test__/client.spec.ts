import { beforeEach, describe, expect, it, vi } from "vitest";

type PublicApiModule = typeof import("../client");

async function loadPublicApiClient(): Promise<
  PublicApiModule["publicApiClient"]
> {
  vi.stubEnv("VITE_PUBLIC_BFF_BASE_URL", "");
  vi.stubEnv("VITE_USE_API_MOCKS", "");
  vi.resetModules();
  const module: PublicApiModule = await import("../client");
  return module.publicApiClient;
}

describe("publicApiClient", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe("cities", () => {
    it("deve listar apenas cidades publicadas", async () => {
      const publicApiClient = await loadPublicApiClient();

      const result = await publicApiClient.listPublishedCities();

      expect(result.length).toBeGreaterThan(0);
      expect(result.every((item) => item.published)).toBe(true);
    });

    it("deve buscar cidade publicada por slug", async () => {
      const publicApiClient = await loadPublicApiClient();

      const allCities = await publicApiClient.listPublishedCities();
      const firstCity = allCities[0];

      const result = await publicApiClient.getPublishedCityBySlug(
        firstCity.slug,
      );

      expect(result).not.toBeNull();
      expect(result?.slug).toBe(firstCity.slug);
      expect(result?.published).toBe(true);
    });

    it("deve retornar null ao buscar cidade inexistente ou não publicada", async () => {
      const publicApiClient = await loadPublicApiClient();

      const result =
        await publicApiClient.getPublishedCityBySlug("cidade-inexistente");

      expect(result).toBeNull();
    });
  });

  describe("events", () => {
    it("deve listar apenas eventos publicados", async () => {
      const publicApiClient = await loadPublicApiClient();

      const result = await publicApiClient.listPublishedEvents({
        page: 1,
        limit: 50,
      });

      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items.every((item) => item.published)).toBe(true);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
      expect(result.total).toBeGreaterThan(0);
    });

    it("deve filtrar eventos por citySlug", async () => {
      const publicApiClient = await loadPublicApiClient();

      const result = await publicApiClient.listPublishedEvents({
        citySlug: "dourados",
        page: 1,
        limit: 50,
      });

      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items.every((item) => item.citySlug === "dourados")).toBe(
        true,
      );
    });

    it("deve filtrar eventos por categoria", async () => {
      const publicApiClient = await loadPublicApiClient();

      const result = await publicApiClient.listPublishedEvents({
        category: "gastronomia",
        page: 1,
        limit: 50,
      });

      expect(result.items.length).toBeGreaterThan(0);
      expect(
        result.items.every((item) => item.category === "gastronomia"),
      ).toBe(true);
    });

    it("deve filtrar eventos por busca", async () => {
      const publicApiClient = await loadPublicApiClient();

      const result = await publicApiClient.listPublishedEvents({
        search: "festival",
        page: 1,
        limit: 50,
      });

      expect(result.items.length).toBeGreaterThan(0);
      expect(
        result.items.every((item) =>
          `${item.name} ${item.description}`.toLowerCase().includes("festival"),
        ),
      ).toBe(true);
    });

    it("deve paginar eventos publicados", async () => {
      const publicApiClient = await loadPublicApiClient();

      const firstPage = await publicApiClient.listPublishedEvents({
        page: 1,
        limit: 1,
      });

      const secondPage = await publicApiClient.listPublishedEvents({
        page: 2,
        limit: 1,
      });

      expect(firstPage.items).toHaveLength(1);
      expect(secondPage.items).toHaveLength(1);
      expect(firstPage.items[0]?.id).not.toBe(secondPage.items[0]?.id);
    });

    it("deve buscar evento publicado por id", async () => {
      const publicApiClient = await loadPublicApiClient();

      const list = await publicApiClient.listPublishedEvents({
        page: 1,
        limit: 50,
      });

      const firstItem = list.items[0];

      const result = await publicApiClient.getPublishedEventById(firstItem.id);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(firstItem.id);
      expect(result?.published).toBe(true);
    });

    it("deve retornar null ao buscar evento inexistente", async () => {
      const publicApiClient = await loadPublicApiClient();

      const result = await publicApiClient.getPublishedEventById(999999);

      expect(result).toBeNull();
    });
  });

  describe("tourist points", () => {
    it("deve listar apenas pontos turísticos publicados", async () => {
      const publicApiClient = await loadPublicApiClient();

      const result = await publicApiClient.listPublishedTouristPoints({
        page: 1,
        limit: 50,
      });

      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items.every((item) => item.published)).toBe(true);
      expect(result.total).toBeGreaterThan(0);
    });

    it("deve filtrar pontos turísticos por citySlug", async () => {
      const publicApiClient = await loadPublicApiClient();

      const result = await publicApiClient.listPublishedTouristPoints({
        citySlug: "dourados",
        page: 1,
        limit: 50,
      });

      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items.every((item) => item.citySlug === "dourados")).toBe(
        true,
      );
    });

    it("deve filtrar pontos turísticos por categoria", async () => {
      const publicApiClient = await loadPublicApiClient();

      const result = await publicApiClient.listPublishedTouristPoints({
        category: "parque",
        page: 1,
        limit: 50,
      });

      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items.every((item) => item.category === "parque")).toBe(
        true,
      );
    });

    it("deve filtrar pontos turísticos por busca", async () => {
      const publicApiClient = await loadPublicApiClient();

      const result = await publicApiClient.listPublishedTouristPoints({
        search: "parque",
        page: 1,
        limit: 50,
      });

      expect(result.items.length).toBeGreaterThan(0);
      expect(
        result.items.every((item) =>
          `${item.name} ${item.description}`.toLowerCase().includes("parque"),
        ),
      ).toBe(true);
    });

    it("deve paginar pontos turísticos publicados", async () => {
      const publicApiClient = await loadPublicApiClient();

      const firstPage = await publicApiClient.listPublishedTouristPoints({
        page: 1,
        limit: 1,
      });

      const secondPage = await publicApiClient.listPublishedTouristPoints({
        page: 2,
        limit: 1,
      });

      expect(firstPage.items).toHaveLength(1);
      expect(secondPage.items).toHaveLength(1);
      expect(firstPage.items[0]?.id).not.toBe(secondPage.items[0]?.id);
    });

    it("deve buscar ponto turístico publicado por id", async () => {
      const publicApiClient = await loadPublicApiClient();

      const list = await publicApiClient.listPublishedTouristPoints({
        page: 1,
        limit: 50,
      });

      const firstItem = list.items[0];

      const result = await publicApiClient.getPublishedTouristPointById(
        firstItem.id,
      );

      expect(result).not.toBeNull();
      expect(result?.id).toBe(firstItem.id);
      expect(result?.published).toBe(true);
    });

    it("deve retornar null ao buscar ponto turístico inexistente", async () => {
      const publicApiClient = await loadPublicApiClient();

      const result = await publicApiClient.getPublishedTouristPointById(999999);

      expect(result).toBeNull();
    });
  });

  describe("institutional content", () => {
    it("deve obter o conteúdo institucional público", async () => {
      const publicApiClient = await loadPublicApiClient();

      const result = await publicApiClient.getInstitutionalContent();

      expect(result).toBeDefined();
      expect(result.aboutTitle).toBeTruthy();
      expect(result.mission).toBeTruthy();
      expect(Array.isArray(result.values)).toBe(true);
    });
  });

  describe("social links", () => {
    it("deve listar apenas links sociais ativos ordenados", async () => {
      const publicApiClient = await loadPublicApiClient();

      const result = await publicApiClient.listActiveSocialLinks();

      expect(result.length).toBeGreaterThan(0);
      expect(result.every((item) => item.active)).toBe(true);

      for (let index = 1; index < result.length; index += 1) {
        expect(result[index - 1].order).toBeLessThanOrEqual(
          result[index].order,
        );
      }
    });
  });

  describe("home content", () => {
    it("deve retornar apenas banners e destaques ativos", async () => {
      const publicApiClient = await loadPublicApiClient();

      const result = await publicApiClient.getHomeContent();

      expect(Array.isArray(result.banners)).toBe(true);
      expect(Array.isArray(result.highlights)).toBe(true);
      expect(result.banners.every((item) => item.active)).toBe(true);
      expect(result.highlights.every((item) => item.active)).toBe(true);
    });

    it("deve retornar banners e destaques ordenados por ordem", async () => {
      const publicApiClient = await loadPublicApiClient();

      const result = await publicApiClient.getHomeContent();

      for (let index = 1; index < result.banners.length; index += 1) {
        expect(result.banners[index - 1].order).toBeLessThanOrEqual(
          result.banners[index].order,
        );
      }

      for (let index = 1; index < result.highlights.length; index += 1) {
        expect(result.highlights[index - 1].order).toBeLessThanOrEqual(
          result.highlights[index].order,
        );
      }
    });
  });
});
