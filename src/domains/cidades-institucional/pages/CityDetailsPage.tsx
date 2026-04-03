import { type ReactElement } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  Container,
  Section,
  SectionHeader,
} from "@/design-system/ui";
import { usePublishedCityBySlug } from "@/domains/cidades-institucional/hooks/usePublishedCityBySlug";
import { EmptyState } from "@/domains/catalogo-publico/shared/components/EmptyState";
import { truncateMetaDescription } from "@/shell/public/seo/truncateMetaDescription";
import { usePublicPageMetadata } from "@/shell/public/seo/usePublicPageMetadata";

interface ICityRouteParams {
  slug?: string;
}

export function CityDetailsPage(): ReactElement {
  const params = useParams<keyof ICityRouteParams>();
  const slug: string | undefined = params.slug;

  const {
    city: cidade,
    isLoading,
    notFound,
    error,
  } = usePublishedCityBySlug(slug);

  const canonicalCidadePath = slug ? `/cidades/${slug}` : "/cidades";

  usePublicPageMetadata({
    title: cidade
      ? `${cidade.name} | Cidades | Celeiro do MS`
      : error
        ? "Erro ao carregar cidade | Celeiro do MS"
        : isLoading
          ? "Carregando cidade… | Celeiro do MS"
          : "Cidade | Celeiro do MS",
    description: cidade
      ? truncateMetaDescription(
          cidade.summary || cidade.description || cidade.name,
        )
      : undefined,
    canonicalPath: canonicalCidadePath,
  });

  if (isLoading) {
    return (
      <Section spacing="xl">
        <p className="text-sm text-zinc-600">Carregando cidade...</p>
      </Section>
    );
  }

  if (error) {
    return (
      <Section spacing="xl">
        <EmptyState title="Erro ao carregar a cidade" description={error} />
        <div className="mt-6">
          <Link
            to="/cidades"
            className="text-sm font-medium text-[var(--color-secondary)] underline-offset-4 hover:underline"
          >
            Voltar para cidades
          </Link>
        </div>
      </Section>
    );
  }

  if (notFound) {
    return <Navigate to="/cidades" replace />;
  }

  if (!cidade) {
    return <Navigate to="/cidades" replace />;
  }

  return (
    <div className="bg-portal">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg-light)] to-transparent" />

        <Container className="relative py-12 md:py-16">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <div className="space-y-2">
                <span className="inline-flex rounded-full bg-white/80 px-3 py-1 text-sm font-medium text-[var(--color-secondary)]">
                  Cidade do Celeiro do MS
                </span>

                <h1 className="text-4xl font-bold leading-tight text-zinc-900 md:text-5xl">
                  {cidade.name}
                </h1>

                <p className="text-lg font-medium text-zinc-600">
                  {cidade.state}
                </p>
              </div>

              <p className="max-w-2xl text-base leading-7 text-zinc-700">
                {cidade.summary}
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link to={`/eventos?cidade=${cidade.slug}`}>
                  <Button variant="secondary" size="lg">
                    Ver eventos da cidade
                  </Button>
                </Link>

                <Link to={`/pontos-turisticos?cidade=${cidade.slug}`}>
                  <Button variant="primary" size="lg">
                    Ver pontos turísticos
                  </Button>
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-soft">
              {cidade.imageUrl ? (
                <img
                  src={cidade.imageUrl}
                  alt={cidade.name}
                  className="h-[360px] w-full object-cover"
                />
              ) : (
                <div className="h-[360px] w-full bg-zinc-100" />
              )}
            </div>
          </div>
        </Container>
      </section>

      <Section spacing="xl">
        <SectionHeader description="Uma visão institucional inicial da cidade dentro do portal Celeiro do MS.">
          Conheça {cidade.name}
        </SectionHeader>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <h2 className="text-lg font-semibold text-zinc-900">
              Identidade local
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              {cidade.description ??
                `${cidade.name} integra o território do Celeiro do MS e compõe uma rede regional de cultura, turismo e experiências locais.`}
            </p>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-zinc-900">
              Eventos e agenda
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              O portal concentra a divulgação de eventos e oportunidades de
              visitação conectadas à cidade.
            </p>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-zinc-900">
              Atrativos e descoberta
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              A navegação futura pode destacar roteiros, atrativos, experiências
              culturais e conteúdos institucionais específicos da cidade.
            </p>
          </Card>
        </div>
      </Section>
    </div>
  );
}
