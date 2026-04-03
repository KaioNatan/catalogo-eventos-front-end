import type { ReactElement } from "react";
import { skeletonBlockClass } from "./skeletonPrimitives";

/**
 * Mesmo grid visual de `CatalogFilters` (3 colunas) para transição suave ao carregar cidades.
 */
export function CatalogFiltersSkeleton(): ReactElement {
  return (
    <section
      className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
      aria-hidden
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <div className={`h-4 w-16 ${skeletonBlockClass}`} />
          <div className={`h-10 w-full rounded-xl ${skeletonBlockClass}`} />
        </div>
        <div className="space-y-2">
          <div className={`h-4 w-14 ${skeletonBlockClass}`} />
          <div className={`h-10 w-full rounded-xl ${skeletonBlockClass}`} />
        </div>
        <div className="space-y-2">
          <div className={`h-4 w-20 ${skeletonBlockClass}`} />
          <div className={`h-10 w-full rounded-xl ${skeletonBlockClass}`} />
        </div>
      </div>
    </section>
  );
}
