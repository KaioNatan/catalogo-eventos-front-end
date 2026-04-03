import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HeroSection } from "../HeroSection";

describe("HeroSection", () => {
  it("deve renderizar título básico", () => {
    render(<HeroSection title="Título principal" />);
    expect(screen.getByText("Título principal")).toBeInTheDocument();
  });

  it("deve renderizar kicker e subtitle quando fornecidos", () => {
    render(
      <HeroSection
        kicker="Institucional"
        title="Sobre o portal"
        subtitle="Texto de apoio"
      />,
    );

    expect(screen.getByText("Institucional")).toBeInTheDocument();
    expect(screen.getByText("Texto de apoio")).toBeInTheDocument();
  });

  it("deve renderizar actions com href e com onClick", () => {
    const onClick = vi.fn();

    render(
      <HeroSection
        title="Hero"
        actions={[
          { label: "Ir para eventos", href: "/eventos", variant: "primary" },
          { label: "Ação local", onClick, variant: "secondary" },
        ]}
      />,
    );

    expect(
      screen.getByRole("link", { name: "Ir para eventos" }),
    ).toHaveAttribute("href", "/eventos");

    fireEvent.click(screen.getByRole("button", { name: "Ação local" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("deve renderizar rightSlot quando fornecido", () => {
    render(
      <HeroSection
        title="Hero"
        rightSlot={<div data-testid="right-slot">Right slot</div>}
      />,
    );

    expect(screen.getByTestId("right-slot")).toBeInTheDocument();
  });

  it("deve suportar align='center' e tone='warning'", () => {
    render(<HeroSection title="Hero central" align="center" tone="warning" />);

    expect(screen.getByText("Hero central")).toBeInTheDocument();
  });
});
