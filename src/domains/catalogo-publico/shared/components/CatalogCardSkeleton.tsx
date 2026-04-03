import type { ReactElement } from "react";
import { skeletonBlockClass } from "./skeletonPrimitives";

export function CatalogCardSkeleton(): ReactElement {
  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className={`h-56 w-full ${skeletonBlockClass}`} />
      <div className="space-y-3 p-5">
        <div className={`h-3 w-24 ${skeletonBlockClass}`} />
        <div className={`h-5 w-3/4 ${skeletonBlockClass}`} />
        <div className="space-y-2">
          <div className={`h-4 w-full ${skeletonBlockClass}`} />
          <div className={`h-4 w-full ${skeletonBlockClass}`} />
          <div className={`h-4 w-2/3 ${skeletonBlockClass}`} />
        </div>
        <div className={`h-4 w-1/2 ${skeletonBlockClass}`} />
        <div className={`h-10 w-32 rounded-xl ${skeletonBlockClass}`} />
      </div>
    </article>
  );
}
