import type { ReactElement } from "react";
import { Button, Card, Section, SectionHeader } from "@/design-system/ui";
import { usePublicCities } from "@/domains/public-portal/cities/hooks/usePublicCities";
import { Link } from "react-router-dom";
import { CityCard } from "./CityCard";

export function CitiesGridSection(): ReactElement {
  const { cities, isLoading, error } = usePublicCities();

  return (
    <Section spacing="xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeader
          kicker="Área de atuação"
          tone="primary"
          description="Cidades que compõem a região atendida pelo Celeiro do MS."
        >
          Cidades do Celeiro do MS
        </SectionHeader>

        {!isLoading && !error ? (
          <Link to="/cidades" className="shrink-0">
            <Button variant="ghost" size="sm">
              Ver todas as cidades
            </Button>
          </Link>
        ) : null}
      </div>

      {isLoading ? (
        <div className="mt-8">
          <Card>
            <p className="text-sm text-zinc-600">Carregando cidades...</p>
          </Card>
        </div>
      ) : null}

      {error ? (
        <div className="mt-8">
          <Card className="border border-red-200 bg-red-50">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </Card>
        </div>
      ) : null}

      {!isLoading && !error ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {cities.map((cidade) => (
            <CityCard key={cidade.id} cidade={cidade} />
          ))}
        </div>
      ) : null}
    </Section>
  );
}
