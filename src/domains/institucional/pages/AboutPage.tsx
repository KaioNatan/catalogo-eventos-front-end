import { Card, HeroSection, Section, SectionHeader } from "@/design-system/ui";
import { useInstitutionalContent } from "@/domains/public-portal/institutional/hooks/useInstitutionalContent";
import { usePublicPageMetadata } from "@/shell/public/seo/usePublicPageMetadata";
import type { ReactElement } from "react";

export function AboutPage(): ReactElement {
  usePublicPageMetadata({
    title: "Sobre | Celeiro do MS",
    description:
      "Conheça o propósito do Celeiro do MS e a valorização do território sul-mato-grossense.",
    canonicalPath: "/sobre",
  });

  const { content, isLoading, error } = useInstitutionalContent();

  return (
    <div className="bg-portal">
      <Section spacing="xl">
        <HeroSection
          kicker="Institucional"
          tone="success"
          title={content?.aboutTitle ?? "Sobre o Celeiro do MS"}
          subtitle={
            content?.aboutText ??
            "Uma iniciativa voltada à valorização do território, da cultura, do turismo e das experiências regionais."
          }
        />
      </Section>

      <Section spacing="xl">
        <SectionHeader
          kicker="Quem somos"
          tone="primary"
          description="Entenda o propósito do portal e seu papel na divulgação regional."
        >
          {content?.whoWeAreTitle ?? "Uma vitrine digital do território"}
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
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-zinc-900">Missão</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                {content?.mission ?? "Conteúdo não informado."}
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-zinc-900">Visão</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                {content?.vision ?? "Conteúdo não informado."}
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold text-zinc-900">Valores</h2>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-600">
                {(content?.values ?? []).length > 0 ? (
                  content?.values.map((value: string) => (
                    <li key={value}>• {value}</li>
                  ))
                ) : (
                  <li>• Conteúdo não informado.</li>
                )}
              </ul>
            </Card>
          </div>
        ) : null}
      </Section>

      <Section spacing="xl">
        <SectionHeader
          kicker="Propósito"
          tone="success"
          description="O portal existe para conectar pessoas, cidades, experiências e oportunidades da região."
        >
          {content?.purposeTitle ?? "O que o Celeiro do MS promove"}
        </SectionHeader>

        {!isLoading && !error ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-base font-semibold text-zinc-900">
                {content?.whoWeAreTitle ?? "Divulgação regional integrada"}
              </h3>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                {content?.whoWeAreText ?? "Conteúdo não informado."}
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="text-base font-semibold text-zinc-900">
                {content?.purposeTitle ?? "Valorização do território"}
              </h3>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                {content?.purposeText ?? "Conteúdo não informado."}
              </p>
            </Card>
          </div>
        ) : null}
      </Section>
    </div>
  );
}
