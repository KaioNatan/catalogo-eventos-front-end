import type { ReactElement } from "react";
import type { ICatalogoItem } from "../model/catalogo.types";
import { CatalogCard } from "./CatalogCard";

interface ICatalogGridProps {
  items: ICatalogoItem[];
}

export function CatalogGrid({ items }: ICatalogGridProps): ReactElement {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item: ICatalogoItem) => (
        <CatalogCard key={`${item.kind}-${item.id}`} item={item} />
      ))}
    </div>
  );
}
