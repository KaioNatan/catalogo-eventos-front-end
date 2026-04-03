import type { ReactElement } from "react";
import { Card, SectionHeader } from "@/design-system/ui";
import { useAdminDashboardStats } from "@/domains/admin-cms/dashboard/hooks/useAdminDashboardStats";

const skeletonBarClass: string =
  "h-9 w-16 rounded bg-zinc-200 motion-safe:animate-pulse motion-reduce:animate-none";

function StatCard(props: {
  label: string;
  value: string | number | null;
  isLoading: boolean;
}): ReactElement {
  const { label, value, isLoading } = props;

  return (
    <Card>
      <p className="text-sm font-medium text-zinc-500">{label}</p>
      {isLoading ? (
        <div className={`mt-2 ${skeletonBarClass}`} aria-hidden />
      ) : (
        <p className="mt-2 text-3xl font-bold text-zinc-900">{value ?? "—"}</p>
      )}
    </Card>
  );
}

export function AdminDashboardPage(): ReactElement {
  const { stats, isLoading, error } = useAdminDashboardStats();

  return (
    <div className="space-y-8">
      <SectionHeader
        kicker="Painel"
        tone="primary"
        description="Visão inicial da área administrativa do Celeiro do MS."
      >
        Dashboard
      </SectionHeader>

      {error ? (
        <Card className="border border-red-200 bg-red-50">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </Card>
      ) : null}

      <div
        className="grid gap-5 md:grid-cols-2 xl:grid-cols-4"
        {...(isLoading
          ? {
              role: "status",
              "aria-live": "polite" as const,
              "aria-label": "Carregando totais do painel",
            }
          : {})}
      >
        <StatCard
          label="Cidades"
          value={stats?.cityCount ?? null}
          isLoading={isLoading}
        />
        <StatCard
          label="Eventos"
          value={stats?.eventCount ?? null}
          isLoading={isLoading}
        />
        <StatCard
          label="Pontos turísticos"
          value={stats?.touristPointCount ?? null}
          isLoading={isLoading}
        />
        <StatCard
          label="Destaques da home"
          value={stats?.homeHighlightCount ?? null}
          isLoading={isLoading}
        />
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-zinc-900">Navegação</h2>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Use o menu lateral para gerenciar cidades, eventos, pontos turísticos,
          conteúdo da home, institucional e demais módulos.
        </p>
      </Card>
    </div>
  );
}
