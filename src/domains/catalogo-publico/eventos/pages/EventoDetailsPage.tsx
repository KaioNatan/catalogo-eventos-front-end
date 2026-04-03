import {
  Button,
  Card,
  Container,
  Section,
  SectionHeader,
} from "@/design-system/ui";
import { labelForEventCategory } from "@/constants/contentCategories";
import { usePublishedEventById } from "@/domains/catalogo-publico/eventos/hooks/usePublishedEventById";
import { EmptyState } from "@/domains/catalogo-publico/shared/components/EmptyState";
import { PublicEntityDetailSkeleton } from "@/domains/catalogo-publico/shared/components/PublicEntityDetailSkeleton";
import { truncateMetaDescription } from "@/shell/public/seo/truncateMetaDescription";
import { usePublicPageMetadata } from "@/shell/public/seo/usePublicPageMetadata";
import { type ReactElement } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

interface IEventRouteParams {
  id?: number;
}

export function EventoDetailsPage(): ReactElement {
  const params = useParams<keyof IEventRouteParams>();
  const rawId = Number(params.id);
  const id: number | undefined =
    Number.isFinite(rawId) && rawId > 0 ? rawId : undefined;

  const { event, isLoading, notFound, error } = usePublishedEventById(id);

  const canonicalEventPath =
    Number.isFinite(id) && id !== undefined && id > 0
      ? `/eventos/${id}`
      : "/eventos";

  usePublicPageMetadata({
    title: event
      ? `${event.name} | Eventos | Celeiro do MS`
      : error
        ? "Erro ao carregar evento | Celeiro do MS"
        : isLoading
          ? "Carregando evento… | Celeiro do MS"
          : "Evento | Celeiro do MS",
    description: event ? truncateMetaDescription(event.description) : undefined,
    canonicalPath: canonicalEventPath,
  });

  if (isLoading) {
    return (
      <PublicEntityDetailSkeleton loadingLabel="Carregando dados do evento" />
    );
  }

  if (error) {
    return (
      <Section spacing="xl">
        <EmptyState title="Erro ao carregar o evento" description={error} />
        <div className="mt-6">
          <Link
            to="/eventos"
            className="text-sm font-medium text-[var(--color-secondary)] underline-offset-4 hover:underline"
          >
            Voltar para eventos
          </Link>
        </div>
      </Section>
    );
  }

  if (notFound) {
    return <Navigate to="/eventos" replace />;
  }

  if (!event) {
    return <Navigate to="/eventos" replace />;
  }

  return (
    <div className="bg-portal">
      <section className="relative overflow-hidden">
        <Container className="py-12 md:py-16">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <div className="space-y-2">
                {event.category ? (
                  <span className="inline-flex rounded-full bg-[var(--color-bg-light)] px-3 py-1 text-sm font-medium text-[var(--color-secondary)]">
                    {labelForEventCategory(event.category)}
                  </span>
                ) : null}

                <h1 className="text-4xl font-bold leading-tight text-zinc-900 md:text-5xl">
                  {event.name}
                </h1>

                <div className="space-y-1 text-sm text-zinc-600">
                  {event.formattedDate ? <p>{event.formattedDate}</p> : null}
                  {event.location ? <p>{event.location}</p> : null}
                </div>
              </div>

              <p className="max-w-2xl text-base leading-7 text-zinc-700">
                {event.description}
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link to={`/cidades/${event.citySlug}`}>
                  <Button variant="secondary" size="lg">
                    Ver cidade
                  </Button>
                </Link>

                <Link to={`/eventos?cidade=${event.citySlug}`}>
                  <Button variant="ghost" size="lg">
                    Voltar para eventos
                  </Button>
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-soft">
              {event.imageUrl ? (
                <img
                  src={event.imageUrl}
                  alt={event.name}
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
        <SectionHeader description="Estrutura inicial preparada para receber dados mais completos da API real.">
          Informações do evento
        </SectionHeader>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <h2 className="text-lg font-semibold text-zinc-900">Categoria</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              {event.category
                ? labelForEventCategory(event.category)
                : "Não informado"}
            </p>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-zinc-900">Cidade</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              {event.citySlug}
            </p>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-zinc-900">Local</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              {event.location ?? "Não informado"}
            </p>
          </Card>
        </div>
      </Section>
    </div>
  );
}
