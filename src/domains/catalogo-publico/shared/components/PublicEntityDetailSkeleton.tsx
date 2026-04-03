import { Card, Container, Section, SectionHeader } from "@/design-system/ui";
import type { ReactElement } from "react";
import { skeletonBlockClass } from "./skeletonPrimitives";

interface IPublicEntityDetailSkeletonProps {
  /** Rótulo para leitores de tela (ex.: tipo de recurso carregando). */
  loadingLabel: string;
}

/**
 * Espelha o layout de `EventoDetailsPage` / `PontoTuristicoDetailsPage` (hero + faixa de cards).
 */
export function PublicEntityDetailSkeleton({
  loadingLabel,
}: IPublicEntityDetailSkeletonProps): ReactElement {
  return (
    <div className="bg-portal">
      <div
        role="status"
        className="block"
        aria-live="polite"
        aria-busy="true"
        aria-label={loadingLabel}
      >
        <section className="relative overflow-hidden">
          <Container className="py-12 md:py-16">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-5">
                <div className="space-y-2">
                  <div
                    className={`h-8 w-24 rounded-full ${skeletonBlockClass}`}
                  />
                  <div
                    className={`h-12 w-full max-w-xl rounded-lg ${skeletonBlockClass}`}
                  />
                  <div
                    className={`h-12 w-4/5 max-w-lg rounded-lg ${skeletonBlockClass}`}
                  />
                  <div className="space-y-1 pt-1">
                    <div className={`h-4 w-48 ${skeletonBlockClass}`} />
                    <div className={`h-4 w-56 ${skeletonBlockClass}`} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div
                    className={`h-4 w-full max-w-2xl ${skeletonBlockClass}`}
                  />
                  <div
                    className={`h-4 w-full max-w-2xl ${skeletonBlockClass}`}
                  />
                  <div className={`h-4 w-2/3 max-w-xl ${skeletonBlockClass}`} />
                </div>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div
                    className={`h-12 w-40 rounded-lg ${skeletonBlockClass}`}
                  />
                  <div
                    className={`h-12 w-52 rounded-lg ${skeletonBlockClass}`}
                  />
                </div>
              </div>
              <div
                className={`h-[360px] w-full overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-soft ${skeletonBlockClass}`}
              />
            </div>
          </Container>
        </section>

        <Section spacing="xl">
          <SectionHeader description="Carregando informações.">
            Detalhes
          </SectionHeader>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[0, 1, 2].map((key) => (
              <Card key={key}>
                <div className={`h-6 w-28 ${skeletonBlockClass}`} />
                <div className={`mt-3 h-4 w-full ${skeletonBlockClass}`} />
                <div className={`mt-2 h-4 w-3/4 ${skeletonBlockClass}`} />
              </Card>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
