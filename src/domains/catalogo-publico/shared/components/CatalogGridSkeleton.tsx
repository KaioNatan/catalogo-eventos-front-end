import type { ReactElement } from "react";
import { CatalogCardSkeleton } from "./CatalogCardSkeleton";

interface ICatalogGridSkeletonProps {
  count?: number;
}

export function CatalogGridSkeleton({
  count = 6,
}: ICatalogGridSkeletonProps): ReactElement {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index: number) => (
        <CatalogCardSkeleton key={index} />
      ))}
    </div>
  );
}
