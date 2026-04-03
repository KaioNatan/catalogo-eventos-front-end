import { trackPublicEvent } from "@/analytics/publicAnalytics";
import { cn } from "@/design-system/utils/cn";
import { Section } from "@/design-system/ui";
import { usePublicPageMetadata } from "@/shell/public/seo/usePublicPageMetadata";
import { useEffect, type ReactElement } from "react";
import { Link, useLocation } from "react-router-dom";

/**
 * Rotas públicas não mapeadas. Mantém HTTP 200 no edge (SPA), mas sinaliza noindex para motores de busca.
 */
export function PublicNotFoundPage(): ReactElement {
  const location = useLocation();

  usePublicPageMetadata({
    title: "Página não encontrada | Celeiro do MS",
    description:
      "O endereço não existe neste portal. Volte à página inicial ou use o menu para navegar.",
    noIndex: true,
  });

  useEffect(() => {
    trackPublicEvent("public_404", { path: location.pathname });
  }, [location.pathname]);

  return (
    <div className="bg-portal">
      <Section spacing="xl">
        <div className="mx-auto max-w-lg text-center">
          <p className="text-sm font-medium text-zinc-500">Erro 404</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
            Página não encontrada
          </h1>
          <p className="mt-4 text-sm text-zinc-600">
            Verifique o endereço ou retorne à página inicial para continuar
            navegando.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              className={cn(
                "inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]",
              )}
            >
              Ir para a página inicial
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
