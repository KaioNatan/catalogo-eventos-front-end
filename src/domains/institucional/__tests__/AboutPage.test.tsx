import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AboutPage } from "../pages/AboutPage";

vi.mock(
  "@/domains/public-portal/institutional/hooks/useInstitutionalContent",
  () => ({
    useInstitutionalContent: vi.fn(),
  }),
);

import { useInstitutionalContent } from "@/domains/public-portal/institutional/hooks/useInstitutionalContent";

describe("AboutPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useInstitutionalContent).mockReturnValue({
      content: {
        id: 1,
        aboutTitle: "Sobre o Celeiro do MS",
        aboutText: "Texto sobre o portal.",
        whoWeAreTitle: "Quem somos",
        whoWeAreText: "Somos uma vitrine digital do território.",
        purposeTitle: "Propósito",
        purposeText: "Promover visibilidade regional.",
        mission: "Divulgar eventos e atrativos.",
        vision: "Ser referência digital regional.",
        values: ["Transparência", "Valorização regional"],
        updatedAt: new Date().toISOString(),
      },
      isLoading: false,
      error: "",
    });
  });

  it("deve renderizar o título principal da página", () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Sobre o Celeiro do MS")).toBeInTheDocument();
  });

  it("deve renderizar as seções institucionais principais", () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Missão")).toBeInTheDocument();
    expect(screen.getByText("Visão")).toBeInTheDocument();
    expect(screen.getByText("Valores")).toBeInTheDocument();
  });

  it("deve renderizar os blocos institucionais carregados do CMS", () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByText("Somos uma vitrine digital do território."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Promover visibilidade regional."),
    ).toBeInTheDocument();
  });
});
