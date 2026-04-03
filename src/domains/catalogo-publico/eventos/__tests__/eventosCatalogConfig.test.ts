import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchEventosCatalogo } from "../config/eventosCatalogConfig";

vi.mock("@/services/public-api/client", () => ({
  publicApiClient: {
    listPublishedEvents: vi.fn(),
  },
}));

import { publicApiClient } from "@/services/public-api/client";

describe("fetchEventosCatalogo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve mapear eventos para itens de catálogo", async () => {
    vi.mocked(publicApiClient.listPublishedEvents).mockResolvedValue({
      items: [
        {
          id: 1,
          cityId: 1,
          citySlug: "dourados",
          name: "Festival Gastronômico",
          description: "Sabores regionais",
          category: "gastronomia",
          formattedDate: "20 a 22 de março de 2026",
          location: "Parque dos Ipês",
          imageUrl: "/images/festival.jpg",
          featured: true,
          published: true,
          startDate: "2026-03-20",
          endDate: "2026-03-22",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      total: 1,
      page: 1,
      limit: 6,
    });

    const result = await fetchEventosCatalogo({
      cidade: "dourados",
      page: 1,
      limit: 6,
    });

    expect(result).toEqual({
      items: [
        {
          id: 1,
          kind: "evento",
          cidadeId: 1,
          cidadeSlug: "dourados",
          titulo: "Festival Gastronômico",
          descricao: "Sabores regionais",
          imagemUrl: "/images/festival.jpg",
          categoria: "Gastronomia",
          dataLabel: "20 a 22 de março de 2026",
          localLabel: "Parque dos Ipês",
          destaque: true,
          href: "/eventos/1",
          ctaLabel: "Ver evento",
        },
      ],
      total: 1,
      page: 1,
      limit: 6,
    });
  });

  it("deve encaminhar filtros para o client", async () => {
    vi.mocked(publicApiClient.listPublishedEvents).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 12,
    });

    await fetchEventosCatalogo({
      cidade: "dourados",
      busca: "festival",
      categoria: "gastronomia",
      page: 1,
      limit: 12,
    });

    expect(publicApiClient.listPublishedEvents).toHaveBeenCalledWith({
      citySlug: "dourados",
      search: "festival",
      category: "gastronomia",
      page: 1,
      limit: 12,
    });
  });
});
