import type { ChangeEvent, ReactElement } from "react";
import type {
  ICatalogoFiltersConfig,
  ICatalogoFiltersValue,
} from "../model/catalogo.filters";
import { ICity } from "@/entities/city/city.types";

interface ICatalogFiltersProps {
  cidadeSlug: string;
  cidades: ICity[];
  value: ICatalogoFiltersValue;
  config: ICatalogoFiltersConfig;
  onCidadeChange: (slug: string) => void;
  onChange: (nextValue: ICatalogoFiltersValue) => void;
}

export function CatalogFilters({
  cidadeSlug,
  cidades,
  value,
  config,
  onCidadeChange,
  onChange,
}: ICatalogFiltersProps): ReactElement {
  function handleBuscaChange(event: ChangeEvent<HTMLInputElement>): void {
    onChange({
      ...value,
      busca: event.target.value,
    });
  }

  function handleCategoriaChange(event: ChangeEvent<HTMLSelectElement>): void {
    onChange({
      ...value,
      categoria: event.target.value,
    });
  }

  function handleCidadeChange(event: ChangeEvent<HTMLSelectElement>): void {
    onCidadeChange(event.target.value);
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label
            htmlFor="catalogo-cidade"
            className="text-sm font-medium text-zinc-700"
          >
            Cidade
          </label>

          <select
            id="catalogo-cidade"
            value={cidadeSlug}
            onChange={handleCidadeChange}
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 outline-none transition focus:border-[var(--color-primary)]"
          >
            {cidades.map((cidade: ICity) => (
              <option key={cidade.id} value={cidade.slug}>
                {cidade.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="catalogo-busca"
            className="text-sm font-medium text-zinc-700"
          >
            Buscar
          </label>

          <input
            id="catalogo-busca"
            type="text"
            value={value.busca}
            onChange={handleBuscaChange}
            placeholder={config.searchPlaceholder ?? "Busque por nome"}
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm text-zinc-800 outline-none transition focus:border-[var(--color-primary)]"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="catalogo-categoria"
            className="text-sm font-medium text-zinc-700"
          >
            Categoria
          </label>

          <select
            id="catalogo-categoria"
            value={value.categoria}
            onChange={handleCategoriaChange}
            className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 outline-none transition focus:border-[var(--color-primary)]"
          >
            <option value="">Todas</option>
            {config.categorias.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
