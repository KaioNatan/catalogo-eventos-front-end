import { describe, expect, it, vi, beforeEach } from "vitest";
import { fetchPontosCatalogo } from "../config/pontosCatalogConfig";

vi.mock("@/services/public-api/publicTouristPoints.api", () => ({
  loadPublishedTouristPointsCatalog: vi.fn(),
}));

import { loadPublishedTouristPointsCatalog } from "@/services/public-api/publicTouristPoints.api";

describe("fetchPontosCatalogo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve mapear pontos turísticos para itens de catálogo", async () => {
    vi.mocked(loadPublishedTouristPointsCatalog).mockResolvedValue({
      items: [
        {
          id: 1,
          cityId: 1,
          citySlug: "dourados",
          name: "Parque Antenor Martins",
          description: "Área verde com lazer",
          category: "parque",
          address: "Rua Antônio Emílio de Figueiredo",
          imageUrl: "/images/parque.jpg",
          featured: true,
          published: true,
          openingHours: "08:00",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      total: 1,
      page: 1,
      limit: 6,
    });

    const result = await fetchPontosCatalogo({
      cidade: "dourados",
      page: 1,
      limit: 6,
    });

    expect(result).toEqual({
      items: [
        {
          id: 1,
          kind: "ponto-turistico",
          cidadeId: 1,
          cidadeSlug: "dourados",
          titulo: "Parque Antenor Martins",
          descricao: "Área verde com lazer",
          imagemUrl: "/images/parque.jpg",
          categoria: "Parque",
          localLabel: "Rua Antônio Emílio de Figueiredo",
          destaque: true,
          href: "/pontos-turisticos/1",
          ctaLabel: "Ver local",
        },
      ],
      total: 1,
      page: 1,
      limit: 6,
    });
  });
});
