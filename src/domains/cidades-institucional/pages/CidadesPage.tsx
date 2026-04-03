import { Card, Section, SectionHeader } from "@/design-system/ui";
import { CityCard } from "@/domains/home-institucional/components/CityCard";
import { EmptyState } from "@/domains/catalogo-publico/shared/components/EmptyState";
import { usePublicCities } from "@/domains/public-portal/cities/hooks/usePublicCities";
import { usePublicPageMetadata } from "@/shell/public/seo/usePublicPageMetadata";
import { type ReactElement } from "react";

export function CidadesPage(): ReactElement {
  usePublicPageMetadata({
    title: "Cidades | Celeiro do MS",
    description:
      "Conheça os municípios que integram a rede do Celeiro do MS — cultura, turismo e eventos.",
    canonicalPath: "/cidades",
  });

  const { cities, isLoading, error } = usePublicCities();

  const isEmpty: boolean = !isLoading && !error && cities.length === 0;

  return (
    <Section spacing="xl">
      <SectionHeader
        kicker="Território"
        tone="primary"
        description="Explore as cidades publicadas no portal e acesse agenda, atrativos e conteúdo local."
      >
        Cidades do Celeiro do MS
      </SectionHeader>

      {isLoading ? (
        <div className="mt-8">
          <Card>
            <p className="text-sm text-zinc-600">Carregando cidades…</p>
          </Card>
        </div>
      ) : null}

      {error ? (
        <div className="mt-8">
          <EmptyState title="Erro ao carregar cidades" description={error} />
        </div>
      ) : null}

      {isEmpty ? (
        <div className="mt-8">
          <EmptyState
            title="Nenhuma cidade disponível"
            description="Não há cidades publicadas no momento."
          />
        </div>
      ) : null}

      {!isLoading && !error && cities.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {cities.map((cidade) => (
            <CityCard key={cidade.id} cidade={cidade} />
          ))}
        </div>
      ) : null}
    </Section>
  );
}
