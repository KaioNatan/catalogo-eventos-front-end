import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CatalogFilters } from "../components/CatalogFilters";
import type {
  ICatalogoFiltersConfig,
  ICatalogoFiltersValue,
} from "../model/catalogo.filters";
import { ICity } from "@/entities/city/city.types";

describe("CatalogFilters", () => {
  const cidades: ICity[] = [
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
  ];

  const config: ICatalogoFiltersConfig = {
    searchPlaceholder: "Busque por nome",
    categorias: [
      { label: "Feira", value: "feira" },
      { label: "Parque", value: "parque" },
    ],
  };

  const value: ICatalogoFiltersValue = {
    busca: "",
    categoria: "",
  };

  it("deve renderizar os campos de cidade, busca e categoria", () => {
    render(
      <CatalogFilters
        cidadeSlug="dourados"
        cidades={cidades}
        value={value}
        config={config}
        onCidadeChange={vi.fn()}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Cidade")).toBeInTheDocument();
    expect(screen.getByLabelText("Buscar")).toBeInTheDocument();
    expect(screen.getByLabelText("Categoria")).toBeInTheDocument();
  });

  it("deve chamar onCidadeChange ao trocar a cidade", () => {
    const onCidadeChange = vi.fn();

    render(
      <CatalogFilters
        cidadeSlug="dourados"
        cidades={cidades}
        value={value}
        config={config}
        onCidadeChange={onCidadeChange}
        onChange={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Cidade"), {
      target: { value: "itapora" },
    });

    expect(onCidadeChange).toHaveBeenCalledTimes(1);
    expect(onCidadeChange).toHaveBeenCalledWith("itapora");
  });

  it("deve chamar onChange ao digitar na busca", () => {
    const onChange = vi.fn();

    render(
      <CatalogFilters
        cidadeSlug="dourados"
        cidades={cidades}
        value={value}
        config={config}
        onCidadeChange={vi.fn()}
        onChange={onChange}
      />,
    );

    fireEvent.change(screen.getByLabelText("Buscar"), {
      target: { value: "festival" },
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({
      busca: "festival",
      categoria: "",
    });
  });

  it("deve chamar onChange ao trocar a categoria", () => {
    const onChange = vi.fn();

    render(
      <CatalogFilters
        cidadeSlug="dourados"
        cidades={cidades}
        value={value}
        config={config}
        onCidadeChange={vi.fn()}
        onChange={onChange}
      />,
    );

    fireEvent.change(screen.getByLabelText("Categoria"), {
      target: { value: "feira" },
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({
      busca: "",
      categoria: "feira",
    });
  });

  it("deve exibir o placeholder configurado", () => {
    render(
      <CatalogFilters
        cidadeSlug="dourados"
        cidades={cidades}
        value={value}
        config={config}
        onCidadeChange={vi.fn()}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByPlaceholderText("Busque por nome")).toBeInTheDocument();
  });
});
