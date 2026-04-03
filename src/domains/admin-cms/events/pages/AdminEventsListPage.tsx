import { useState, type ReactElement } from "react";
import { Link } from "react-router-dom";
import { Button, Card, SectionHeader } from "@/design-system/ui";
import type { IEvent } from "@/entities/event/event.types";
import { AdminCrmListTableSkeleton } from "@/domains/admin-cms/components/AdminCrmListTableSkeleton";
import { useAdminEventsList } from "@/domains/admin-cms/events/hooks/useAdminEventsList";
import { toApiError } from "@/services/api/apiError";
import { deleteAdminEvent } from "@/services/admin-api/adminEvents.api";

export function AdminEventsListPage(): ReactElement {
  const { items, setItems, isLoading, error: loadError } = useAdminEventsList();
  const [error, setError] = useState<string>("");

  async function handleDelete(id: number): Promise<void> {
    try {
      setError("");

      await deleteAdminEvent(id);

      setItems((currentItems: IEvent[]) =>
        currentItems.filter((item: IEvent) => item.id !== id),
      );
    } catch (caught) {
      setError(toApiError(caught).message);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <SectionHeader
          kicker="Admin CMS"
          tone="primary"
          description="Gerencie os eventos exibidos no portal público."
        >
          Eventos
        </SectionHeader>

        <Link to="/admin/eventos/novo">
          <Button variant="primary">Novo evento</Button>
        </Link>
      </div>

      {error || loadError ? (
        <Card className="border border-red-200 bg-red-50">
          <p className="text-sm font-medium text-red-700">
            {error || loadError}
          </p>
        </Card>
      ) : null}

      <Card>
        {isLoading ? <AdminCrmListTableSkeleton /> : null}

        {!isLoading && items.length === 0 ? (
          <p className="text-sm text-zinc-600">Nenhum evento cadastrado.</p>
        ) : null}

        {!isLoading && items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500">
                  <th className="py-3">Nome</th>
                  <th className="py-3">Cidade</th>
                  <th className="py-3">Categoria</th>
                  <th className="py-3">Destaque</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: IEvent) => (
                  <tr key={item.id} className="border-b border-zinc-100">
                    <td className="py-4">{item.name}</td>
                    <td className="py-4">{item.citySlug}</td>
                    <td className="py-4">{item.category ?? "-"}</td>
                    <td className="py-4">{item.featured ? "Sim" : "Não"}</td>
                    <td className="py-4">
                      {item.published ? "Publicado" : "Rascunho"}
                    </td>
                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <Link to={`/admin/eventos/${item.id}/editar`}>
                          <Button variant="secondary" size="sm">
                            Editar
                          </Button>
                        </Link>

                        <Button
                          variant="accent"
                          size="sm"
                          onClick={() => void handleDelete(item.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
