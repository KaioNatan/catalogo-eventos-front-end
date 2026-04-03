import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import { HomeHeroCarousel } from "../HomeHeroCarousel";

const navigateMock = vi.fn();

vi.mock("@/services/public-api/client", () => ({
  publicApiClient: {
    getHomeContent: vi.fn(),
  },
}));

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

import { publicApiClient } from "@/services/public-api/client";

describe("HomeHeroCarousel", () => {
  beforeEach(() => {
    navigateMock.mockClear();

    vi.mocked(publicApiClient.getHomeContent).mockResolvedValue({
      banners: [],
      highlights: [
        {
          id: 1,
          type: "event",
          referenceId: "event-1",
          title: "Festival Gastronômico de Dourados",
          description: "Sabores regionais.",
          imageUrl: "/images/highlights/festival-gastronomico.jpg",
          cityName: "Dourados",
          ctaUrl: "/eventos/event-1",
          active: true,
          order: 1,
        },
        {
          id: 2,
          type: "tourist-point",
          referenceId: "tourist-point-1",
          title: "Parque Antenor Martins",
          description: "Área verde com lazer.",
          imageUrl: "/images/highlights/parque-antenor-martins.jpg",
          cityName: "Dourados",
          ctaUrl: "/pontos-turisticos/tourist-point-1",
          active: true,
          order: 2,
        },
        {
          id: 3,
          type: "custom",
          title: "Mostra de Música Regional",
          description: "Programação especial.",
          imageUrl: "/images/highlights/musica.jpg",
          cityName: "Itaporã",
          ctaUrl: "/eventos",
          active: true,
          order: 3,
        },
      ],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("deve renderizar o primeiro destaque inicialmente", async () => {
    render(
      <MemoryRouter>
        <HomeHeroCarousel />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText("Festival Gastronômico de Dourados"),
    ).toBeInTheDocument();

    expect(screen.getByText("1/3")).toBeInTheDocument();
  });

  it("deve navegar para o próximo item ao clicar em Próximo", async () => {
    render(
      <MemoryRouter>
        <HomeHeroCarousel />
      </MemoryRouter>,
    );

    await screen.findByText("Festival Gastronômico de Dourados");

    fireEvent.click(screen.getByRole("button", { name: "Próximo" }));

    expect(screen.getByAltText("Parque Antenor Martins")).toBeInTheDocument();
    expect(screen.getByTestId("carousel-counter")).toHaveTextContent("2/3");
  });
});
