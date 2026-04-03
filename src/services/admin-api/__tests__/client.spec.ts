import { beforeEach, describe, expect, it, vi } from "vitest";

type AdminApiModule = typeof import("../client");

async function loadAdminApiClient(): Promise<AdminApiModule["adminApiClient"]> {
  vi.stubEnv("VITE_PUBLIC_BFF_BASE_URL", "");
  vi.stubEnv("VITE_ADMIN_BFF_BASE_URL", "");
  vi.stubEnv("VITE_USE_API_MOCKS", "");
  vi.resetModules();
  const module: AdminApiModule = await import("../client");
  return module.adminApiClient;
}

describe("adminApiClient", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe("institutional content", () => {
    it("deve cadastrar quando ainda não existe registro (mock)", async () => {
      vi.stubEnv("VITE_PUBLIC_BFF_BASE_URL", "");
      vi.stubEnv("VITE_ADMIN_BFF_BASE_URL", "");
      vi.stubEnv("VITE_USE_API_MOCKS", "");
      vi.resetModules();
      const mockData = await import("@/services/in-memory/mock-data");
      mockData.setInstitutionalRecordPresent(false);
      const module: AdminApiModule = await import("../client");
      const adminApiClient = module.adminApiClient;

      expect(await adminApiClient.getInstitutionalContent()).toBeNull();

      const created = await adminApiClient.createInstitutionalContent({
        aboutTitle: "Sobre",
        aboutText: "Texto sobre",
        whoWeAreTitle: "Quem",
        whoWeAreText: "Somos",
        purposeTitle: "Propósito",
        purposeText: "Prop texto",
        mission: "Missão",
        vision: "Visão",
        values: ["A", "B"],
      });

      expect(created.id).toBe(1);
      expect(created.aboutTitle).toBe("Sobre");
      expect(await adminApiClient.getInstitutionalContent()).not.toBeNull();

      mockData.setInstitutionalRecordPresent(true);
    });

    it("deve obter e atualizar o conteúdo institucional", async () => {
      const adminApiClient = await loadAdminApiClient();

      const initialContent = await adminApiClient.getInstitutionalContent();

      expect(initialContent).not.toBeNull();
      expect(initialContent!.aboutTitle).toBeTruthy();

      const updatedContent = await adminApiClient.updateInstitutionalContent({
        id: initialContent!.id,
        aboutTitle: "Novo título institucional",
        aboutText: "Novo texto institucional",
        whoWeAreTitle: "Quem somos atualizado",
        whoWeAreText: "Texto atualizado de quem somos",
        purposeTitle: "Propósito atualizado",
        purposeText: "Texto atualizado de propósito",
        mission: "Nova missão",
        vision: "Nova visão",
        values: ["Transparência", "Inovação", "Regionalismo"],
      });

      expect(updatedContent.aboutTitle).toBe("Novo título institucional");
      expect(updatedContent.mission).toBe("Nova missão");
      expect(updatedContent.values).toEqual([
        "Transparência",
        "Inovação",
        "Regionalismo",
      ]);

      const persistedContent = await adminApiClient.getInstitutionalContent();

      expect(persistedContent).not.toBeNull();
      expect(persistedContent!.aboutTitle).toBe("Novo título institucional");
      expect(persistedContent!.vision).toBe("Nova visão");
    });
  });

  describe("social links", () => {
    it("deve listar, criar, atualizar e excluir links sociais", async () => {
      const adminApiClient = await loadAdminApiClient();

      const initialItems = await adminApiClient.listSocialLinks();
      const initialCount = initialItems.length;

      const createdItem = await adminApiClient.createSocialLink({
        platform: "instagram",
        label: "Instagram oficial",
        url: "https://instagram.com/celeirodoms",
        active: true,
        order: 99,
      });

      expect(createdItem.id).toBeTruthy();
      expect(createdItem.label).toBe("Instagram oficial");

      const afterCreate = await adminApiClient.listSocialLinks();

      expect(afterCreate).toHaveLength(initialCount + 1);
      expect(afterCreate.some((item) => item.id === createdItem.id)).toBe(true);

      const updatedItem = await adminApiClient.updateSocialLink({
        id: createdItem.id,
        label: "Instagram atualizado",
        active: false,
        order: 5,
      });

      expect(updatedItem.label).toBe("Instagram atualizado");
      expect(updatedItem.active).toBe(false);
      expect(updatedItem.order).toBe(5);

      const afterUpdate = await adminApiClient.listSocialLinks();
      const persistedItem = afterUpdate.find(
        (item) => item.id === createdItem.id,
      );

      expect(persistedItem).toBeDefined();
      expect(persistedItem?.label).toBe("Instagram atualizado");
      expect(persistedItem?.active).toBe(false);

      await adminApiClient.deleteSocialLink(createdItem.id);

      const afterDelete = await adminApiClient.listSocialLinks();

      expect(afterDelete).toHaveLength(initialCount);
      expect(afterDelete.some((item) => item.id === createdItem.id)).toBe(
        false,
      );
    });

    it("deve lançar erro ao atualizar link social inexistente", async () => {
      const adminApiClient = await loadAdminApiClient();

      await expect(
        adminApiClient.updateSocialLink({
          id: 999999,
          label: "Item inexistente",
        }),
      ).rejects.toThrow();
    });
  });

  describe("cities", () => {
    it("deve listar, buscar por id/slug, criar, atualizar e excluir cidades", async () => {
      const adminApiClient = await loadAdminApiClient();

      const initialItems = await adminApiClient.listCities();
      const initialCount = initialItems.length;

      expect(initialItems.length).toBeGreaterThan(0);

      const firstCity = initialItems[0];

      const foundById = await adminApiClient.getCityById(firstCity.id);
      const foundBySlug = await adminApiClient.getCityBySlug(firstCity.slug);

      expect(foundById?.id).toBe(firstCity.id);
      expect(foundBySlug?.slug).toBe(firstCity.slug);

      const createdItem = await adminApiClient.createCity({
        name: "Cidade Teste",
        slug: "cidade-teste",
        state: "MS",
        summary: "Resumo da cidade teste",
        description: "Descrição da cidade teste",
        imageUrl: "/images/cidades/cidade-teste.jpg",
        published: true,
      });

      expect(createdItem.id).toBeTruthy();
      expect(createdItem.name).toBe("Cidade Teste");

      const afterCreate = await adminApiClient.listCities();

      expect(afterCreate).toHaveLength(initialCount + 1);

      const updatedItem = await adminApiClient.updateCity({
        id: createdItem.id,
        name: "Cidade Teste Atualizada",
        published: false,
      });

      expect(updatedItem.name).toBe("Cidade Teste Atualizada");
      expect(updatedItem.published).toBe(false);

      const persisted = await adminApiClient.getCityById(createdItem.id);

      expect(persisted?.name).toBe("Cidade Teste Atualizada");
      expect(persisted?.published).toBe(false);

      await adminApiClient.deleteCity(createdItem.id);

      const afterDelete = await adminApiClient.listCities();

      expect(afterDelete).toHaveLength(initialCount);
      expect(afterDelete.some((item) => item.id === createdItem.id)).toBe(
        false,
      );
    });

    it("deve retornar null ao buscar cidade inexistente por id e slug", async () => {
      const adminApiClient = await loadAdminApiClient();

      await expect(adminApiClient.getCityById(999999)).resolves.toBeNull();
      await expect(
        adminApiClient.getCityBySlug("cidade-inexistente"),
      ).resolves.toBeNull();
    });

    it("deve lançar erro ao atualizar cidade inexistente", async () => {
      const adminApiClient = await loadAdminApiClient();

      await expect(
        adminApiClient.updateCity({
          id: 999999,
          name: "Cidade inexistente",
        }),
      ).rejects.toThrow();
    });
  });

  describe("events", () => {
    it("deve listar, buscar por id, criar, atualizar e excluir eventos", async () => {
      const adminApiClient = await loadAdminApiClient();

      const initialItems = await adminApiClient.listEvents();
      const initialCount = initialItems.length;

      expect(initialItems.length).toBeGreaterThan(0);

      const firstItem = initialItems[0];
      const foundById = await adminApiClient.getEventById(firstItem.id);

      expect(foundById?.id).toBe(firstItem.id);

      const createdItem = await adminApiClient.createEvent({
        cityId: 1,
        citySlug: "dourados",
        name: "Evento Teste",
        description: "Descrição do evento teste",
        category: "teatro",
        startDate: "2026-04-10",
        endDate: "2026-04-12",
        formattedDate: "10 a 12 de abril de 2026",
        location: "Centro de Eventos",
        imageUrl: "/images/events/evento-teste.jpg",
        featured: true,
        published: true,
      });

      expect(createdItem.id).toBeTruthy();
      expect(createdItem.name).toBe("Evento Teste");

      const afterCreate = await adminApiClient.listEvents();

      expect(afterCreate).toHaveLength(initialCount + 1);

      const updatedItem = await adminApiClient.updateEvent({
        id: createdItem.id,
        name: "Evento Teste Atualizado",
        featured: false,
      });

      expect(updatedItem.name).toBe("Evento Teste Atualizado");
      expect(updatedItem.featured).toBe(false);

      const persisted = await adminApiClient.getEventById(createdItem.id);

      expect(persisted?.name).toBe("Evento Teste Atualizado");
      expect(persisted?.featured).toBe(false);

      await adminApiClient.deleteEvent(createdItem.id);

      const afterDelete = await adminApiClient.listEvents();

      expect(afterDelete).toHaveLength(initialCount);
      expect(afterDelete.some((item) => item.id === createdItem.id)).toBe(
        false,
      );
    });

    it("deve retornar null ao buscar evento inexistente", async () => {
      const adminApiClient = await loadAdminApiClient();

      await expect(adminApiClient.getEventById(999999)).resolves.toBeNull();
    });

    it("deve lançar erro ao atualizar evento inexistente", async () => {
      const adminApiClient = await loadAdminApiClient();

      await expect(
        adminApiClient.updateEvent({
          id: 999999,
          name: "Evento inexistente",
        }),
      ).rejects.toThrow();
    });
  });

  describe("tourist points", () => {
    it("deve listar, buscar por id, criar, atualizar e excluir pontos turísticos", async () => {
      const adminApiClient = await loadAdminApiClient();

      const initialItems = await adminApiClient.listTouristPoints();
      const initialCount = initialItems.length;

      expect(initialItems.length).toBeGreaterThan(0);

      const firstItem = initialItems[0];
      const foundById = await adminApiClient.getTouristPointById(firstItem.id);

      expect(foundById?.id).toBe(firstItem.id);

      const createdItem = await adminApiClient.createTouristPoint({
        cityId: 1,
        citySlug: "dourados",
        name: "Ponto Teste",
        description: "Descrição do ponto teste",
        category: "parque",
        address: "Rua do Lago, 123",
        openingHours: "08:00",
        imageUrl: "/images/tourist-points/ponto-teste.jpg",
        featured: true,
        published: true,
      });

      expect(createdItem.id).toBeTruthy();
      expect(createdItem.name).toBe("Ponto Teste");

      const afterCreate = await adminApiClient.listTouristPoints();

      expect(afterCreate).toHaveLength(initialCount + 1);

      const updatedItem = await adminApiClient.updateTouristPoint({
        id: createdItem.id,
        name: "Ponto Teste Atualizado",
        featured: false,
      });

      expect(updatedItem.name).toBe("Ponto Teste Atualizado");
      expect(updatedItem.featured).toBe(false);

      const persisted = await adminApiClient.getTouristPointById(
        createdItem.id,
      );

      expect(persisted?.name).toBe("Ponto Teste Atualizado");
      expect(persisted?.featured).toBe(false);

      await adminApiClient.deleteTouristPoint(createdItem.id);

      const afterDelete = await adminApiClient.listTouristPoints();

      expect(afterDelete).toHaveLength(initialCount);
      expect(afterDelete.some((item) => item.id === createdItem.id)).toBe(
        false,
      );
    });

    it("deve retornar null ao buscar ponto turístico inexistente", async () => {
      const adminApiClient = await loadAdminApiClient();

      await expect(
        adminApiClient.getTouristPointById(999999),
      ).resolves.toBeNull();
    });

    it("deve lançar erro ao atualizar ponto turístico inexistente", async () => {
      const adminApiClient = await loadAdminApiClient();

      await expect(
        adminApiClient.updateTouristPoint({
          id: 999999,
          name: "Ponto inexistente",
        }),
      ).rejects.toThrow();
    });
  });

  describe("home banners", () => {
    it("deve listar, criar, atualizar e excluir banners da home", async () => {
      const adminApiClient = await loadAdminApiClient();

      const initialItems = await adminApiClient.listHomeBanners();
      const initialCount = initialItems.length;

      const createdItem = await adminApiClient.createHomeBanner({
        title: "Banner Teste",
        subtitle: "Subtítulo do banner teste",
        imageUrl: "/images/banners/banner-teste.jpg",
        ctaLabel: "Saiba mais",
        ctaUrl: "/eventos",
        active: true,
        order: 99,
      });

      expect(createdItem.id).toBeTruthy();
      expect(createdItem.title).toBe("Banner Teste");

      const afterCreate = await adminApiClient.listHomeBanners();

      expect(afterCreate).toHaveLength(initialCount + 1);

      const updatedItem = await adminApiClient.updateHomeBanner({
        id: createdItem.id,
        title: "Banner Teste Atualizado",
        active: false,
      });

      expect(updatedItem.title).toBe("Banner Teste Atualizado");
      expect(updatedItem.active).toBe(false);

      const persisted = (await adminApiClient.listHomeBanners()).find(
        (item) => item.id === createdItem.id,
      );

      expect(persisted?.title).toBe("Banner Teste Atualizado");
      expect(persisted?.active).toBe(false);

      await adminApiClient.deleteHomeBanner(createdItem.id);

      const afterDelete = await adminApiClient.listHomeBanners();

      expect(afterDelete).toHaveLength(initialCount);
      expect(afterDelete.some((item) => item.id === createdItem.id)).toBe(
        false,
      );
    });

    it("deve lançar erro ao atualizar banner inexistente", async () => {
      const adminApiClient = await loadAdminApiClient();

      await expect(
        adminApiClient.updateHomeBanner({
          id: 999999,
          title: "Banner inexistente",
        }),
      ).rejects.toThrow();
    });
  });

  describe("home highlights", () => {
    it("deve listar, criar, atualizar e excluir destaques da home", async () => {
      const adminApiClient = await loadAdminApiClient();

      const initialItems = await adminApiClient.listHomeHighlights();
      const initialCount = initialItems.length;

      const createdItem = await adminApiClient.createHomeHighlight({
        type: "custom",
        referenceId: undefined,
        title: "Destaque Teste",
        description: "Descrição do destaque teste",
        imageUrl: "/images/highlights/destaque-teste.jpg",
        cityName: "Dourados",
        ctaUrl: "/eventos",
        active: true,
        order: 99,
      });

      expect(createdItem.id).toBeTruthy();
      expect(createdItem.title).toBe("Destaque Teste");

      const afterCreate = await adminApiClient.listHomeHighlights();

      expect(afterCreate).toHaveLength(initialCount + 1);

      const updatedItem = await adminApiClient.updateHomeHighlight({
        id: createdItem.id,
        title: "Destaque Teste Atualizado",
        active: false,
      });

      expect(updatedItem.title).toBe("Destaque Teste Atualizado");
      expect(updatedItem.active).toBe(false);

      const persisted = (await adminApiClient.listHomeHighlights()).find(
        (item) => item.id === createdItem.id,
      );

      expect(persisted?.title).toBe("Destaque Teste Atualizado");
      expect(persisted?.active).toBe(false);

      await adminApiClient.deleteHomeHighlight(createdItem.id);

      const afterDelete = await adminApiClient.listHomeHighlights();

      expect(afterDelete).toHaveLength(initialCount);
      expect(afterDelete.some((item) => item.id === createdItem.id)).toBe(
        false,
      );
    });

    it("deve lançar erro ao atualizar destaque inexistente", async () => {
      const adminApiClient = await loadAdminApiClient();

      await expect(
        adminApiClient.updateHomeHighlight({
          id: 999999,
          title: "Destaque inexistente",
        }),
      ).rejects.toThrow();
    });
  });
});
