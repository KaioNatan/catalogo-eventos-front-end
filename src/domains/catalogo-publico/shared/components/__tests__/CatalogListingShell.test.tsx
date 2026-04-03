import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CatalogListingShell } from "../CatalogListingShell";

describe("CatalogListingShell", () => {
  it("modo replace: exibe skeleton em vez do conteúdo", () => {
    render(
      <CatalogListingShell showSkeleton>
        <p>Conteúdo real</p>
      </CatalogListingShell>,
    );

    expect(screen.queryByText("Conteúdo real")).not.toBeInTheDocument();
    expect(
      screen.getByRole("status", {
        name: /carregando resultados do catálogo/i,
      }),
    ).toBeInTheDocument();
  });

  it("modo replace: exibe filhos quando não está carregando", () => {
    render(
      <CatalogListingShell showSkeleton={false}>
        <p>Conteúdo real</p>
      </CatalogListingShell>,
    );

    expect(screen.getByText("Conteúdo real")).toBeInTheDocument();
  });

  it("modo stale-overlay: mantém staleLayer com overlay quando showSkeleton", () => {
    render(
      <CatalogListingShell
        showSkeleton
        displayMode="stale-overlay"
        staleLayer={<p>Lista anterior</p>}
        staleOverlayLabel="Atualizando…"
      >
        <p>Novo conteúdo</p>
      </CatalogListingShell>,
    );

    expect(screen.getByText("Lista anterior")).toBeInTheDocument();
    expect(screen.getByText("Atualizando…")).toBeInTheDocument();
    expect(screen.queryByText("Novo conteúdo")).not.toBeInTheDocument();
  });
});
