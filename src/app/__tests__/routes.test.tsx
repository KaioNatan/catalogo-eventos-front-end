import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Outlet } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppRoutes } from "../routes";

import { publicApiClient } from "@/services/public-api/client";

vi.mock("@/services/public-api/client", () => ({
  publicApiClient: {
    listActiveSocialLinks: vi.fn(),
    getInstitutionalContent: vi.fn(),
    listPublishedCities: vi.fn(),
    getPublishedCityBySlug: vi.fn(),
    getPublishedEventById: vi.fn(),
    getPublishedTouristPointById: vi.fn(),
    getHomeContent: vi.fn(),
    listPublishedEvents: vi.fn(),
    listPublishedTouristPoints: vi.fn(),
  },
}));

vi.mock("@/shell/public/layouts/PublicLayout", () => ({
  PublicLayout: () => (
    <div data-testid="public-layout">
      Public Layout
      <Outlet />
    </div>
  ),
}));

vi.mock("@/domains/home-institucional/pages/HomePage", () => ({
  HomePage: () => <div>Home mock</div>,
}));

vi.mock("@/domains/catalogo-publico/eventos/pages/EventosPage", () => ({
  EventosPage: () => <div>Eventos mock</div>,
}));

vi.mock("@/domains/catalogo-publico/eventos/pages/EventoDetailsPage", () => ({
  EventoDetailsPage: () => <div>Evento Details mock</div>,
}));

vi.mock("@/domains/catalogo-publico/pontos/pages/PontosTuristicosPage", () => ({
  PontosTuristicosPage: () => <div>Pontos mock</div>,
}));

vi.mock(
  "@/domains/catalogo-publico/pontos/pages/PontoTuristicoDetailsPage",
  () => ({
    PontoTuristicoDetailsPage: () => <div>Ponto Details mock</div>,
  }),
);

vi.mock("@/domains/cidades-institucional/pages/CidadesPage", () => ({
  CidadesPage: () => <div>Cidades list mock</div>,
}));

vi.mock("@/domains/cidades-institucional/pages/CityDetailsPage", () => ({
  CityDetailsPage: () => <div>Cidade Details mock</div>,
}));

vi.mock("@/domains/institucional/pages/AboutPage", () => ({
  AboutPage: () => <div>Sobre mock</div>,
}));

vi.mock("@/domains/admin-cms/dashboard/pages/AdminDashboardPage", () => ({
  AdminDashboardPage: () => <div>Admin Dashboard mock</div>,
}));

vi.mock(
  "@/domains/admin-cms/institutional/pages/AdminInstitutionalPage",
  () => ({
    AdminInstitutionalPage: () => <div>Admin Institucional mock</div>,
  }),
);

vi.mock("@/domains/admin-cms/home-content/pages/AdminHomeBannersPage", () => ({
  AdminHomeBannersPage: () => <div>Admin Home Banners mock</div>,
}));

vi.mock(
  "@/domains/admin-cms/home-content/pages/AdminHomeHighlightsPage",
  () => ({
    AdminHomeHighlightsPage: () => <div>Admin Home Highlights mock</div>,
  }),
);

vi.mock("@/domains/admin-cms/cities/pages/AdminCitiesListPage", () => ({
  AdminCitiesListPage: () => <div>Admin Cities List mock</div>,
}));

vi.mock("@/domains/admin-cms/cities/pages/AdminCityFormPage", () => ({
  AdminCityFormPage: () => <div>Admin City Form mock</div>,
}));

vi.mock("@/domains/admin-cms/events/pages/AdminEventsListPage", () => ({
  AdminEventsListPage: () => <div>Admin Events List mock</div>,
}));

vi.mock("@/domains/admin-cms/events/pages/AdminEventFormPage", () => ({
  AdminEventFormPage: () => <div>Admin Event Form mock</div>,
}));

vi.mock(
  "@/domains/admin-cms/tourist-points/pages/AdminTouristPointsListPage",
  () => ({
    AdminTouristPointsListPage: () => <div>Admin Tourist Points List mock</div>,
  }),
);

vi.mock(
  "@/domains/admin-cms/tourist-points/pages/AdminTouristPointFormPage",
  () => ({
    AdminTouristPointFormPage: () => <div>Admin Tourist Point Form mock</div>,
  }),
);

vi.mock("@/domains/admin-cms/auth/pages/AdminLoginPage", () => ({
  AdminLoginPage: () => <div>Admin Login mock</div>,
}));

vi.mock("@/domains/admin-cms/auth/guards/AdminRouteGuard", () => ({
  AdminRouteGuard: () => <Outlet />,
}));

function renderRoutes(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AppRoutes />
    </MemoryRouter>,
  );
}

describe("AppRoutes", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(publicApiClient.listActiveSocialLinks).mockResolvedValue([
      {
        id: 1,
        platform: "instagram",
        label: "Instagram",
        url: "https://instagram.com",
        active: true,
        order: 1,
      },
    ]);

    vi.mocked(publicApiClient.getInstitutionalContent).mockResolvedValue({
      id: 1,
      aboutTitle: "Sobre o Celeiro do MS",
      aboutText: "Texto sobre o portal.",
      whoWeAreTitle: "Quem somos",
      whoWeAreText: "Somos uma vitrine digital.",
      purposeTitle: "Propósito",
      purposeText: "Promover visibilidade regional.",
      mission: "Divulgar eventos e atrativos.",
      vision: "Ser referência digital regional.",
      values: ["Transparência"],
      updatedAt: new Date().toISOString(),
    });

    vi.mocked(publicApiClient.listPublishedCities).mockResolvedValue([]);
    vi.mocked(publicApiClient.getPublishedCityBySlug).mockResolvedValue(null);
    vi.mocked(publicApiClient.getPublishedEventById).mockResolvedValue(null);
    vi.mocked(publicApiClient.getPublishedTouristPointById).mockResolvedValue(
      null,
    );
    vi.mocked(publicApiClient.getHomeContent).mockResolvedValue({
      banners: [],
      highlights: [],
    });
    vi.mocked(publicApiClient.listPublishedEvents).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 12,
    });
    vi.mocked(publicApiClient.listPublishedTouristPoints).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 12,
    });
  });

  it("deve renderizar a rota home", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByText("Home mock")).toBeInTheDocument();
  });

  it("deve renderizar a rota de eventos", () => {
    render(
      <MemoryRouter initialEntries={["/eventos"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByText("Eventos mock")).toBeInTheDocument();
  });

  it("deve renderizar a rota de detalhe de evento", () => {
    render(
      <MemoryRouter initialEntries={["/eventos/evt-1"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByText("Evento Details mock")).toBeInTheDocument();
  });

  it("deve renderizar a rota de pontos turísticos", () => {
    render(
      <MemoryRouter initialEntries={["/pontos-turisticos"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByText("Pontos mock")).toBeInTheDocument();
  });

  it("deve renderizar a rota de detalhe de ponto turístico", () => {
    render(
      <MemoryRouter initialEntries={["/pontos-turisticos/pto-1"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByText("Ponto Details mock")).toBeInTheDocument();
  });

  it("deve renderizar a rota sobre", () => {
    render(
      <MemoryRouter initialEntries={["/sobre"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByText("Sobre mock")).toBeInTheDocument();
  });

  it("deve renderizar a rota de listagem de cidades", () => {
    render(
      <MemoryRouter initialEntries={["/cidades"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByText("Cidades list mock")).toBeInTheDocument();
  });

  it("deve renderizar a rota de detalhe de cidade", () => {
    render(
      <MemoryRouter initialEntries={["/cidades/dourados"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(screen.getByText("Cidade Details mock")).toBeInTheDocument();
  });

  it("deve renderizar 404 público com noindex para rota desconhecida", async () => {
    render(
      <MemoryRouter initialEntries={["/rota-inexistente"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole("heading", { name: /página não encontrada/i }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(
        document.querySelector('meta[name="robots"]')?.getAttribute("content"),
      ).toBe("noindex, nofollow");
    });
  });

  it("deve renderizar a rota de login admin", async () => {
    render(
      <MemoryRouter initialEntries={["/admin/login"]}>
        <AppRoutes />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Admin Login mock")).toBeInTheDocument();
  });

  it("deve renderizar a rota admin institucional", async () => {
    renderRoutes("/admin/institucional");

    expect(
      await screen.findByText("Admin Institucional mock"),
    ).toBeInTheDocument();
  });

  it("deve renderizar a rota admin home banners", async () => {
    renderRoutes("/admin/home");

    expect(
      await screen.findByText("Admin Home Banners mock"),
    ).toBeInTheDocument();
  });

  it("deve renderizar a rota admin home destaques", async () => {
    renderRoutes("/admin/home/destaques");

    expect(
      await screen.findByText("Admin Home Highlights mock"),
    ).toBeInTheDocument();
  });
});
