import { act, renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ICity } from "@/entities/city/city.types";
import { useCatalogoCidade } from "../hooks/useCatalogoCidade";

vi.mock("@/services/public-api/publicCities.api", () => ({
  loadPublishedCitiesCatalog: vi.fn(),
}));

import { loadPublishedCitiesCatalog } from "@/services/public-api/publicCities.api";

const citiesFixture: ICity[] = [
  {
    id: 1,
    name: "Dourados",
    slug: "dourados",
    state: "MS",
    summary: "",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Itaporã",
    slug: "itapora",
    state: "MS",
    summary: "",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 11,
    name: "Maracaju",
    slug: "maracaju",
    state: "MS",
    summary: "",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function createWrapper(initialEntry: string = "/eventos") {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
    );
  };
}

describe("useCatalogoCidade", () => {
  beforeEach(() => {
    vi.mocked(loadPublishedCitiesCatalog).mockResolvedValue(citiesFixture);
  });

  it("deve usar dourados como fallback quando não houver cidade na url", async () => {
    const { result } = renderHook(() => useCatalogoCidade(), {
      wrapper: createWrapper("/eventos"),
    });

    await waitFor(() => {
      expect(result.current.isCitiesReady).toBe(true);
    });

    expect(result.current.cidadeSlug).toBe("dourados");
    expect(result.current.cidadeNome).toBe("Dourados");
  });

  it("deve usar a cidade da url quando ela for válida", async () => {
    const { result } = renderHook(() => useCatalogoCidade(), {
      wrapper: createWrapper("/eventos?cidade=itapora"),
    });

    await waitFor(() => {
      expect(result.current.isCitiesReady).toBe(true);
    });

    expect(result.current.cidadeSlug).toBe("itapora");
    expect(result.current.cidadeNome).toBe("Itaporã");
  });

  it("deve normalizar cidade inválida para o slug padrão disponível", async () => {
    const { result } = renderHook(() => useCatalogoCidade(), {
      wrapper: createWrapper("/eventos?cidade=inexistente"),
    });

    await waitFor(() => {
      expect(result.current.isCitiesReady).toBe(true);
    });

    expect(result.current.cidadeSlug).toBe("dourados");
    expect(result.current.cidadeNome).toBe("Dourados");
  });

  it("deve permitir alterar a cidade via setCidadeSlug", async () => {
    const { result } = renderHook(() => useCatalogoCidade(), {
      wrapper: createWrapper("/eventos"),
    });

    await waitFor(() => {
      expect(result.current.isCitiesReady).toBe(true);
    });

    act(() => {
      result.current.setCidadeSlug("maracaju");
    });

    expect(result.current.cidadeSlug).toBe("maracaju");
    expect(result.current.cidadeNome).toBe("Maracaju");
  });
});
