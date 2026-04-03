import type { ReactElement, ReactNode } from "react";
import { CatalogGridSkeleton } from "./CatalogGridSkeleton";

export type CatalogListingDisplayMode = "replace" | "stale-overlay";

export interface ICatalogListingShellProps {
  className?: string;
  showSkeleton: boolean;
  skeletonCount?: number;
  /**
   * `replace` (padrão): skeleton substitui o conteúdo durante a carga inicial/refetch.
   * `stale-overlay` (Fase 3): mantém `staleLayer` visível com overlay enquanto `showSkeleton`.
   */
  displayMode?: CatalogListingDisplayMode;
  /** Fase 3: lista anterior; usado só com `displayMode="stale-overlay"`. */
  staleLayer?: ReactNode;
  /** Fase 3: texto curto sobre o overlay (ex.: "Atualizando resultados…"). */
  staleOverlayLabel?: string;
  children: ReactNode;
}

/**
 * Ponto único para alternar skeleton / conteúdo / overlay (Fase 3) sem duplicar páginas.
 */
export function CatalogListingShell({
  className = "mt-8",
  showSkeleton,
  skeletonCount = 6,
  displayMode = "replace",
  staleLayer,
  staleOverlayLabel = "Atualizando resultados…",
  children,
}: ICatalogListingShellProps): ReactElement {
  if (
    displayMode === "stale-overlay" &&
    showSkeleton &&
    staleLayer !== undefined &&
    staleLayer !== null
  ) {
    return (
      <div className={className} aria-busy="true" aria-live="polite">
        <div className="relative min-h-[120px]">
          <div className="pointer-events-none select-none opacity-60 motion-reduce:opacity-90">
            {staleLayer}
          </div>
          <div
            className="absolute inset-0 flex items-start justify-center bg-white/50 pt-10 backdrop-blur-[1px] motion-reduce:backdrop-blur-none"
            aria-hidden
          >
            <p className="rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm">
              {staleOverlayLabel}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={className}
      role={showSkeleton ? "status" : undefined}
      aria-busy={showSkeleton}
      aria-live={showSkeleton ? "polite" : undefined}
      aria-label={
        showSkeleton ? "Carregando resultados do catálogo" : undefined
      }
    >
      {showSkeleton ? <CatalogGridSkeleton count={skeletonCount} /> : children}
    </div>
  );
}
