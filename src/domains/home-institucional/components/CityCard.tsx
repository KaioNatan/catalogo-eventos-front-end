import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { Button, Card } from "@/design-system/ui";
import type { ICity } from "@/entities/city/city.types";

const FALLBACK_CITY_IMG = "/images/fallbacks/cidade-card.jpg";

interface ICityCardProps {
  cidade: ICity;
}

export function CityCard({ cidade }: ICityCardProps): ReactElement {
  return (
    <Card className="group overflow-hidden p-0" hoverable>
      <div className="relative overflow-hidden">
        <img
          src={cidade.imageUrl}
          alt={`Foto de ${cidade.name}`}
          className="h-48 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = FALLBACK_CITY_IMG;
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-80" />
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-secondary)]">
            {cidade.state}
          </p>
          <h3 className="text-lg font-semibold text-zinc-900">{cidade.name}</h3>
        </div>

        <p className="line-clamp-3 text-sm leading-6 text-zinc-600">
          {cidade.summary}
        </p>

        <Link to={`/cidades/${cidade.slug}`} className="inline-flex w-full">
          <Button variant="secondary" fullWidth>
            Ver detalhes da cidade
          </Button>
        </Link>
      </div>
    </Card>
  );
}
