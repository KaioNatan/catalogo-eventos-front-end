import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import type { ICatalogoItem } from "../model/catalogo.types";

interface ICatalogCardProps {
  item: ICatalogoItem;
}

export function CatalogCard({ item }: ICatalogCardProps): ReactElement {
  const ctaLabel: string =
    item.ctaLabel ?? (item.kind === "evento" ? "Ver evento" : "Ver local");

  return (
    <article className="card-soft shadow-soft overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md">
      {item.imagemUrl ? (
        <img
          src={item.imagemUrl}
          alt={item.titulo}
          className="h-56 w-full object-cover"
        />
      ) : (
        <div className="h-56 w-full bg-zinc-100" />
      )}

      <div className="space-y-3 p-5">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
          <span>{item.kind === "evento" ? "Evento" : "Ponto turístico"}</span>
          {item.categoria ? <span>• {item.categoria}</span> : null}
        </div>

        <h3 className="text-lg font-semibold leading-tight text-zinc-900">
          {item.titulo}
        </h3>

        <p className="line-clamp-3 text-sm leading-6 text-zinc-600">
          {item.descricao}
        </p>

        <div className="space-y-1 text-sm text-zinc-500">
          {item.dataLabel ? <p>{item.dataLabel}</p> : null}
          {item.localLabel ? <p>{item.localLabel}</p> : null}
        </div>

        {item.href ? (
          <Link
            to={item.href}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            {ctaLabel}
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex cursor-not-allowed items-center justify-center rounded-xl bg-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-500"
          >
            Em breve
          </button>
        )}
      </div>
    </article>
  );
}
