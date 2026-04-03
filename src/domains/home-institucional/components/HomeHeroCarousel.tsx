import { useEffect, useMemo, useState, type ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Container } from "@/design-system/ui";
import type { IHomeHighlight } from "@/entities/home-content/homeContent.types";
import { usePublicHomeContent } from "@/domains/home-institucional/hooks/usePublicHomeContent";

interface IHomeHighlightItem {
  id: number;
  kind: "evento" | "ponto-turistico" | "custom";
  titulo: string;
  descricao: string;
  cidadeNome?: string;
  imageUrl?: string;
  href: string;
}

const FALLBACK_IMG = "/images/fallbacks/celeiro-highlight.jpg";
const AUTO_PLAY_INTERVAL_MS = 4500;

function getTagLabel(kind: IHomeHighlightItem["kind"]): string {
  return kind === "evento"
    ? "Evento em destaque"
    : "Ponto turístico em destaque";
}

function getTagClassName(kind: IHomeHighlightItem["kind"]): string {
  return kind === "evento"
    ? "bg-[var(--color-accent)] text-zinc-900"
    : "bg-white/90 text-zinc-900";
}

function mapHighlightsToItems(
  highlights: IHomeHighlight[],
): IHomeHighlightItem[] {
  return highlights.map((item: IHomeHighlight) => ({
    id: item.id,
    kind:
      item.type === "event"
        ? "evento"
        : item.type === "tourist-point"
          ? "ponto-turistico"
          : "custom",
    titulo: item.title,
    descricao: item.description,
    cidadeNome: item.cityName,
    imageUrl: item.imageUrl,
    href: item.ctaUrl || "/",
  }));
}

interface IHomeHeroCarouselBodyProps {
  items: IHomeHighlightItem[];
}

function HomeHeroCarouselBody(props: IHomeHeroCarouselBodyProps): ReactElement {
  const { items } = props;
  const navigate = useNavigate();
  const [index, setIndex] = useState<number>(0);

  useEffect(() => {
    if (items.length <= 1) {
      return;
    }

    const timerId: number = window.setInterval(() => {
      setIndex((currentIndex: number) => {
        return (currentIndex + 1) % items.length;
      });
    }, AUTO_PLAY_INTERVAL_MS);

    return () => {
      window.clearInterval(timerId);
    };
  }, [items.length]);

  useEffect(() => {
    items.forEach((item: IHomeHighlightItem) => {
      const image = new Image();
      image.src = item.imageUrl || FALLBACK_IMG;
    });
  }, [items]);

  const currentItem: IHomeHighlightItem = items[index];

  function handleNext(): void {
    setIndex((currentIndex: number) => {
      return (currentIndex + 1) % items.length;
    });
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="relative h-64 sm:h-80 lg:h-[420px]">
        {items.map((item: IHomeHighlightItem, itemIndex: number) => {
          const isActive: boolean = itemIndex === index;

          return (
            <img
              key={item.id}
              src={item.imageUrl || FALLBACK_IMG}
              alt={item.titulo}
              className={[
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
                isActive ? "opacity-100" : "pointer-events-none opacity-0",
              ].join(" ")}
              loading={itemIndex === 0 ? "eager" : "lazy"}
              onError={(event) => {
                event.currentTarget.src = FALLBACK_IMG;
              }}
            />
          );
        })}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/30 to-transparent" />

        <div
          aria-live="polite"
          className="absolute inset-x-0 bottom-0 p-5 sm:p-6 md:p-8"
        >
          <div className="flex items-center gap-2">
            <span
              className={[
                "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                getTagClassName(currentItem.kind),
              ].join(" ")}
              aria-label={getTagLabel(currentItem.kind)}
            >
              {getTagLabel(currentItem.kind)}
            </span>

            <span
              className="text-xs text-white/80"
              aria-label={`Destaque ${index + 1} de ${items.length}`}
              data-testid="carousel-counter"
            >
              {index + 1}/{items.length}
            </span>
          </div>

          <h2
            className="mt-3 max-w-3xl text-2xl font-semibold text-white sm:text-3xl lg:text-4xl"
            data-testid="carousel-title"
          >
            {currentItem.titulo}
          </h2>

          <p
            className="mt-2 max-w-2xl text-sm leading-6 text-white/85 sm:text-base"
            data-testid="carousel-subtitle"
          >
            {currentItem.cidadeNome} • {currentItem.descricao}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              variant="primary"
              onClick={() => navigate(currentItem.href)}
            >
              Ver detalhes
            </Button>

            {items.length > 1 ? (
              <Button variant="ghost" onClick={handleNext}>
                Próximo
              </Button>
            ) : null}
          </div>

          {items.length > 1 ? (
            <div
              className="mt-5 flex gap-2"
              aria-label="Indicadores do carrossel"
            >
              {items.map((item: IHomeHighlightItem, itemIndex: number) => {
                const isActive: boolean = itemIndex === index;

                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-label={`Ir para destaque ${itemIndex + 1}`}
                    aria-current={isActive ? "true" : undefined}
                    data-testid={`carousel-dot-${itemIndex + 1}`}
                    onClick={() => setIndex(itemIndex)}
                    className={[
                      "h-2.5 rounded-full transition",
                      isActive
                        ? "w-8 bg-[var(--color-accent)]"
                        : "w-2.5 bg-white/40 hover:bg-white/70",
                    ].join(" ")}
                  />
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

export function HomeHeroCarousel(): ReactElement | null {
  const { content, isLoading } = usePublicHomeContent();

  const items: IHomeHighlightItem[] = useMemo(() => {
    if (!content) {
      return [];
    }
    return mapHighlightsToItems(content.highlights);
  }, [content]);

  const itemsKey: string = useMemo(
    () => items.map((item: IHomeHighlightItem) => item.id).join(","),
    [items],
  );

  const hasItems: boolean = items.length > 0;

  if (isLoading) {
    return (
      <section className="pt-8 md:pt-12">
        <Container>
          <Card>
            <p className="text-sm text-zinc-600">Carregando destaques...</p>
          </Card>
        </Container>
      </section>
    );
  }

  if (!hasItems) {
    return null;
  }

  return (
    <section className="pt-8 md:pt-12">
      <Container>
        <div className="mb-6 space-y-3">
          <span className="inline-flex rounded-full bg-[var(--color-bg-light)] px-3 py-1 text-sm font-medium text-[var(--color-secondary)]">
            Celeiro do MS
          </span>

          <h1 className="max-w-4xl text-4xl font-bold leading-tight text-zinc-900 md:text-5xl">
            Descubra eventos, experiências e destinos que valorizam o território
            do Celeiro do MS
          </h1>

          <p className="max-w-2xl text-base leading-7 text-zinc-600 md:text-lg">
            Um portal público para conectar pessoas, cidades e oportunidades da
            região com navegação simples e conteúdo relevante.
          </p>
        </div>

        <HomeHeroCarouselBody key={itemsKey} items={items} />
      </Container>
    </section>
  );
}
