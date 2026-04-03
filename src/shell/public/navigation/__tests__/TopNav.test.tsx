import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { TopNav } from "../TopNav";

describe("TopNav", () => {
  it("deve renderizar a marca do portal", () => {
    render(
      <MemoryRouter>
        <TopNav />
      </MemoryRouter>,
    );

    expect(screen.getByText("Celeiro do MS")).toBeInTheDocument();
    expect(screen.getByText("Turismo & Eventos")).toBeInTheDocument();
  });

  it("deve renderizar os links principais", () => {
    render(
      <MemoryRouter>
        <TopNav />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/",
    );

    expect(screen.getByRole("link", { name: "Eventos" })).toHaveAttribute(
      "href",
      "/eventos",
    );

    expect(
      screen.getByRole("link", { name: "Pontos turísticos" }),
    ).toHaveAttribute("href", "/pontos-turisticos");

    expect(screen.getByRole("link", { name: "Cidades" })).toHaveAttribute(
      "href",
      "/cidades",
    );

    expect(screen.getByRole("link", { name: "Sobre" })).toHaveAttribute(
      "href",
      "/sobre",
    );
  });

  it("deve renderizar a logo com texto alternativo", () => {
    render(
      <MemoryRouter>
        <TopNav />
      </MemoryRouter>,
    );

    expect(screen.getByAltText("Logo do Celeiro do MS")).toBeInTheDocument();
  });

  it("deve marcar o link atual conforme a rota", () => {
    render(
      <MemoryRouter initialEntries={["/eventos"]}>
        <TopNav />
      </MemoryRouter>,
    );

    const eventosLink = screen.getByRole("link", { name: "Eventos" });

    expect(eventosLink).toHaveAttribute("aria-current", "page");
  });
});
