import type { ReactElement } from "react";
import { Card, Section, SectionHeader } from "@/design-system/ui";
import { useInstitutionalContent } from "@/domains/public-portal/institutional/hooks/useInstitutionalContent";

export function CeleiroIntroSection(): ReactElement {
  const { content, isLoading, error } = useInstitutionalContent();

  return (
    <Section spacing="xl">
      <SectionHeader
        kicker="Quem somos"
        tone="success"
        description="Conheça o propósito do Celeiro do MS e como apoiamos a divulgação regional."
      >
        {content?.aboutTitle ?? "Sobre o Celeiro do MS"}
      </SectionHeader>

      {isLoading ? (
        <div className="mt-8">
          <Card>
            <p className="text-sm text-zinc-600">Carregando conteúdo...</p>
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
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <Card className="border-[color:rgba(13,139,84,0.12)] p-6">
            <div className="space-y-3">
              <span className="inline-flex rounded-full bg-[var(--color-bg-light)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-secondary)]">
                Missão
              </span>

              <p className="text-sm leading-6 text-zinc-600">
                {content?.mission ?? "Conteúdo não informado."}
              </p>
            </div>
          </Card>

          <Card className="border-[color:rgba(0,152,201,0.12)] p-6">
            <div className="space-y-3">
              <span className="inline-flex rounded-full bg-[color:rgba(0,152,201,0.10)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-primary)]">
                Visão
              </span>

              <p className="text-sm leading-6 text-zinc-600">
                {content?.vision ?? "Conteúdo não informado."}
              </p>
            </div>
          </Card>

          <Card className="border-[color:rgba(223,218,12,0.22)] p-6">
            <div className="space-y-3">
              <span className="inline-flex rounded-full bg-[color:rgba(223,218,12,0.18)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[color:#7b7400]">
                Valores
              </span>

              <ul className="space-y-2 text-sm leading-6 text-zinc-600">
                {(content?.values ?? []).length > 0 ? (
                  content?.values.map((value: string) => (
                    <li key={value}>• {value}</li>
                  ))
                ) : (
                  <li>• Conteúdo não informado.</li>
                )}
              </ul>
            </div>
          </Card>
        </div>
      ) : null}
    </Section>
  );
}
